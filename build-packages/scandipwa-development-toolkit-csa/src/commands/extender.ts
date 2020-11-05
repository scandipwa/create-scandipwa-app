import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import {
    Identifier,
    ExportNamedDeclaration,
    ExportDefaultDeclaration,
    SourceLocation
} from '@babel/types';

import {
    showSourceDirectoryContentInSelect,
    createNewFileFromTemplate,
    getSourcePath,
    getWorkspacePath,
    openFile
} from '../util/file';

import {
    Extendable,
    FileInformation,
    ExportsPaths,
    ExportData,
    ExportType,
    StylesOption
} from '../types/extend-component.types';

const ACTION_POSTFIX = 'action';

class Extender {
    protected pathToSourceFolder: string = '';
    protected extendableName: string = '';
    protected chosenStylesOption: StylesOption | undefined;
    protected extendableType: Extendable;
    protected lastCreatedFilePath: string | undefined;

    /**
     * Initialise instance with corresponding extendable
     * @param extendableType
     */
    constructor(extendableType: Extendable) {
        this.extendableType = extendableType;
        switch (extendableType) {
        case Extendable.route:
            this.pathToSourceFolder = 'src/route';
            break;
        case Extendable.component:
            this.pathToSourceFolder = 'src/component';
            break;
        case Extendable.query:
            this.pathToSourceFolder = 'src/query';
            break;
        case Extendable.store:
            this.pathToSourceFolder = 'src/store';
            break;
        default:
            throw Error('Unexpected extendable type!');
        }
    }

    /**
     * Retrieve name of thing to extend from user
     */
    async getExtendableName() {
        this.extendableName = (await showSourceDirectoryContentInSelect(
            this.pathToSourceFolder,
            `Which ${this.extendableType.toLowerCase()} to override?`
        ))?.label || '';
    }

    /**
     * Extract export nodes from original code
     * @param originalCode
     */
    getExportPathsFromCode(originalCode: string) : ExportsPaths {
        const ast = parse(originalCode, {
            sourceType: "unambiguous",
            plugins: [
                'jsx',
                'classProperties',
                'dynamicImport',
                'optionalCatchBinding',
                'optionalChaining',
                'objectRestSpread'
            ]
        });

        let exportsPaths: ExportsPaths = [];

        traverse(ast, {
            ExportNamedDeclaration: (path) => {
                exportsPaths.push(path);
            },
            ExportDefaultDeclaration: (path) => {
                exportsPaths.push(path);
            }
        });

        return exportsPaths;
    };

    /**
     * Extract additional information from export nodes
     * The following information is retrieved:
     *   + name
     * @param exports
     */
    getNamedExportsNames(exports: ExportsPaths) : ExportData[] {
        const processNamedExport = (path: NodePath<ExportNamedDeclaration>) : ExportData => {
            const getNameFromDeclaration = (declaration: any) : ExportData => {
                const id = <Identifier>declaration.declarations[0].id;
                const { name } = id;

                return { name, type: ExportType.variable };
            };

            const getDataByTraverse = () : ExportData => {
                let searchResult: ExportData = { name: '', type: ExportType.not_yet_assigned };

                traverse(headNode, {
                    ExportSpecifier: (path) => {
                        const { node: { exported: { name } }, node } = path;
                        searchResult = { name, type: ExportType.specifier };
                        path.stop();
                    },
                    ClassDeclaration: (path) => {
                        const { node: { id: { name } }, node } = path;
                        searchResult = { name, type: ExportType.class };
                        path.stop();
                    }
                }, path.scope, null, path.parentPath);

                if (searchResult.type === ExportType.not_yet_assigned) {
                    vscode.window.showWarningMessage(
                        'Could not process some export.'
                        + ' Please, check which export is not processed'
                        + ' and let the developer team know. Thank you!'
                    );
                }

                return searchResult;
            };

            const { node: { declaration }, node: headNode } = path;
            // handle variable declaration
            if (declaration && declaration.type !== 'ClassDeclaration') {
                return getNameFromDeclaration(declaration);
            }

            return getDataByTraverse();
        };

        return exports.filter(e => e.type === 'ExportNamedDeclaration').map(
            (elem): ExportData => processNamedExport(<NodePath<ExportNamedDeclaration>>elem)
        );
    }

    /**
     * Extract additional information from export node
     * The following information is retrieved:
     *   + actual code
     * @param exports
     */
    getDefaultExportCode(exports: ExportsPaths, code: string) : string | undefined {
        const processDefaultExport = (path: NodePath<ExportDefaultDeclaration>) : string => {
            const { node: { loc } } = path;
            const { start, end } = <SourceLocation>loc;

            const codeArray = code.split(/\n/gm);
            const exportDeclarationArray = codeArray.reduce(
                (acc, cur, index) => {
                    const lineNumber = ++index;

                    if (lineNumber >= start.line && lineNumber <= end.line) {
                        if (lineNumber === start.line) {
                            acc.push(cur.slice(start.column));
                        } else if (lineNumber === end.line) {
                            acc.push(cur.slice(0, end.column));
                        } else {
                            acc.push(cur);
                        }
                    }

                    return acc;
                }, new Array<string>()
            );

            return exportDeclarationArray.join('\n');
        };

        const exportDefaultPaths = exports.filter(e => e.type === 'ExportDefaultDeclaration');
        if (!exportDefaultPaths.length) { return; }
        return processDefaultExport(<NodePath<ExportDefaultDeclaration>>exportDefaultPaths[0]);
    }

    /**
     * Retrieve exports that user is willing to extend (from the specified file)
     * @param fileExportsNames
     * @param fileName
     */
    async chooseThingsToExtend(fileExportsNames: string[], fileName: string) : Promise<string[] | undefined> {
        const postfix = fileName.split('.')[1];

        return await vscode.window.showQuickPick(
            fileExportsNames.concat(
                postfix === ACTION_POSTFIX
                    ? ['Add something new!']
                    : []
            ),
            {
                placeHolder: `What do you wish to extend in ${postfix}?`,
                canPickMany: true
            }
        );
    }

    /**
     * Generate all necessary contents for the created file
     */
    generateNewFileContents(fileInfo: FileInformation) : string {
        const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
        const { fileName, allExports, chosenExports, defaultExportCode, originalCode } = fileInfo;
        const generableName = fileName.slice(0, fileName.lastIndexOf('.'));

        const isMapping = (name: string) => ['mapStateToProps', 'mapDispatchToProps'].includes(name);

        const sourceFilePath = path.join(
            `Source${this.extendableType}`,
            this.extendableName,
            generableName
        );

        const notChosenExports = allExports.filter(
            one => !chosenExports.includes(one)
        );

        const generateAdditionalImportString = (): string => {
            if (!defaultExportCode) { return ''; }

            const exdfWords = [
                ...new Set(
                    defaultExportCode.match(/\w+\(/gm)?.filter(
                        word => !['export', 'default'].includes(word)
                    ) || []
                )
            ].map(
                // Cut away parentheses
                str => str.slice(0, str.length - 1)
            );

            return (exdfWords).reduce(
                (acc, importableName): Array<string | undefined> => {
                    const library = originalCode.match(
                        new RegExp(`import.+${importableName}.+from '(?<library>.+)'`)
                    )?.groups?.library;
                    const braces = !!originalCode.match(
                        new RegExp(`import.+{.*${importableName}.*}.+from '(?<library>.+)'`)
                    );

                    if (!library) {
                        return acc;
                    }

                    acc.push(
                        ''.concat('import ')
                        .concat(braces ? '{ ' : '')
                        .concat(`${importableName}`)
                        .concat(braces ? ' }' : '')
                        .concat(` from '${library}';`)
                    );

                    return acc;
                }, new Array<string | undefined>()
            ).join('\n');
        };

        const generateStyleImport = (): string => {
            if (
                [Extendable.route, Extendable.component].includes(this.extendableType)
                && fileName.includes('component')
            ) {
                switch (this.chosenStylesOption) {
                case StylesOption.extend:
                    return `import '${generableName}.style.override'`;

                case StylesOption.override:
                default:
                    return `import '${generableName}.style'`;
                }
            }

            return '';
        };

        const generateImportString = (): string => {
            if (!chosenExports.length) {
                return '';
            }

            return 'import {\n'
                .concat(chosenExports.map(({ name }) => `    ${name} as Source${capitalize(name)},\n`).join(''))
                .concat(notChosenExports.map(({ name }) => `    ${name},\n`).join(''))
                .concat(`} from \'${sourceFilePath}\';`);
        };

        const generateExportsFromSource = (): string => {
            if (!notChosenExports.length) {
                return '';
            }

            return 'export {\n'
                .concat(notChosenExports.map(({ name }) => `    ${name},\n`).join(''))
                .concat('};');
        };

        const generateClassExtend = (): string => {
            const classExport = chosenExports.find(one => one.type === ExportType.class);
            if (!classExport) {
                return '';
            }

            return `export class ${classExport.name} extends Source${classExport.name} {\n`
                + '    // TODO implement logic\n'
                + '};';
        };

        const generateMappingsExtends = (): Array<string> => {
            return chosenExports
                .filter(({ name }) => isMapping(name))
                .map(
                    ({ name }) => {
                        const argument = name.includes('State')
                            ? 'state'
                            : 'dispatch';

                        const newExport =
                            `export const ${name} = ${argument} => ({\n` +
                            `    ...Source${capitalize(name)}(${argument}),\n` +
                            `    // TODO extend ${name}\n` +
                            `});`;

                        return newExport;
                    }
                );
        };

        const generateExtendStrings = (): Array<string> => {
            if (!chosenExports.length) {
                return [];
            }

            return chosenExports
                .filter(one => one.type !== ExportType.class && !isMapping(one.name))
                .map(({ name }) =>
                    `//TODO: implement ${name}\n`
                    + `export const ${name} = Source${capitalize(name)};`
                );
        };

        // Generate new file: imports + exports from source + all extendables + class template + exdf
        const result = [
            generateAdditionalImportString(),
            generateImportString(),
            generateStyleImport(),
            generateExportsFromSource(),
            ...generateExtendStrings(),
            ...generateMappingsExtends(),
            generateClassExtend(),
            defaultExportCode
        ].filter(Boolean).join('\n\n').concat('\n');

        return result;
    };

    /**
     * Create a new file and fill it with given contents
     * @param newFilePath
     * @param contents
     */
    async createNewFileWithContents(newFilePath: string, contents: string) {
        this.createDestinationDirectoryIfNotExists();
        // Prevent overwrites
        if (fs.existsSync(newFilePath)) {
            return;
        }

        fs.writeFile(
            newFilePath,
            contents,
            console.error
        );

        this.lastCreatedFilePath = newFilePath;
    }

    /**
     * Check for directory and create if it does not exist
     */
    createDestinationDirectoryIfNotExists() {
        const destinationDirectoryPath = path.resolve(
            getWorkspacePath(),
            this.pathToSourceFolder,
            this.extendableName
        );

        // Handle destination's parent directory does not exist
        const sourceFolderAbsolutePath = path.resolve(getWorkspacePath(), this.pathToSourceFolder);
        if (!fs.existsSync(sourceFolderAbsolutePath)) {
            fs.mkdirSync(sourceFolderAbsolutePath);
        }

        // Create a extendable-named directory for all extendables excluding the following
        if (![Extendable.query].includes(this.extendableType)) {
            // Handle destination directory does not exist
            if (!fs.existsSync(destinationDirectoryPath)) {
                fs.mkdirSync(destinationDirectoryPath);
            }
        }
    }

    /**
     * Builds a path to the directory of extendable files
     */
    get resourceDirectory() {
        if ([Extendable.component, Extendable.route, Extendable.store].includes(this.extendableType)) {
            return path.join(getSourcePath(this.pathToSourceFolder), this.extendableName);
        }

        return getSourcePath(this.pathToSourceFolder);
    }

    /**
     * Get resource names from component's directory
     */
    getResourceList(): Array<string> {
        if ([Extendable.component, Extendable.route, Extendable.store].includes(this.extendableType)) {
            return fs
                .readdirSync(this.resourceDirectory)
                .filter(fileName => fileName.match(/\.js$/) && fileName !== 'index.js');
        }

        if ([Extendable.query].includes(this.extendableType)) {
            return [`${this.extendableName}.query.js`];
        }

        throw Error('Unexpected extendable type!');
    }

    /**
     * Map chosen things to actual exports
     */
    getChosenExports(chosenThingsToExtend: string[], namedExportsData: ExportData[]) {
        return chosenThingsToExtend.reduce(
            (acc, cur): Array<ExportData> => {
                const foundValue = namedExportsData.find(one => one.name === cur);
                if (foundValue) {
                    acc.push(foundValue);
                }

                return acc;
            }, new Array<ExportData>()
        );
    }

    /**
     * Handle operations with style files (should be called for components and routes only)
     */
    async handleStyles() {
        /**
         * Choose an option
         */
        const chooseStylesOption = async () => {
            this.chosenStylesOption = (await vscode.window.showQuickPick(
                [
                    { label: 'Extend', target: StylesOption.extend },
                    { label: 'Override', target: StylesOption.override },
                    { label: 'Leave as is', target: StylesOption.keep }
                ],
                {
                    placeHolder: 'What would you like to do with styles?',
                    canPickMany: false
                }
            ))?.target;
        };

        /**
         * Create style file from template
         */
        const createStyleFile = () => {
            const extensionRoot = path.join(__dirname, '..', '..');

            this.createDestinationDirectoryIfNotExists();
            createNewFileFromTemplate(
                path.join(extensionRoot, `src/templates/stylesheet.scss`),
                path.join(
                    this.pathToSourceFolder,
                    this.extendableName,
                    `${this.extendableName}.style${
                        this.chosenStylesOption === StylesOption.override ? '.override' : ''
                    }.scss`,
                ),
                /Placeholder/g,
                this.extendableName
            );
        };

        await chooseStylesOption();
        if (!this.chosenStylesOption) {
            vscode.window.showErrorMessage('You must choose what to do with styles');
            return;
        }

        if (this.chosenStylesOption !== StylesOption.keep) {
            createStyleFile();
        }
    }

    /**
     * Entry point
     */
    async process() {
        await this.getExtendableName();
        if (!this.extendableName) {
            vscode.window.showErrorMessage(`${this.extendableType} name is required!`);
            return;
        }

        await (this.getResourceList()).reduce(
            async (acc: Promise<any>, fileName: string): Promise<any> => {
                await acc;
                const fullSourcePath = path.resolve(this.resourceDirectory, fileName);
                const newFilePath = path.resolve(
                    getWorkspacePath(),
                    this.pathToSourceFolder,
                    // Handle extendables like query, which don't have one extra directory
                    ![Extendable.query].includes(this.extendableType) ? this.extendableName : '',
                    fileName
                );

                // Prevent overwriting
                if (fs.existsSync(newFilePath)) {
                    vscode.window.showInformationMessage(`File ${fileName} exists and will not be overwritten`);
                    return;
                }

                const code = fs.readFileSync(fullSourcePath, 'utf-8');
                const exportsPaths = this.getExportPathsFromCode(code);
                const namedExportsData = this.getNamedExportsNames(exportsPaths);
                if (!namedExportsData.length) {
                    vscode.window.showInformationMessage(`No named exports were found in ${fileName.split('.')[1]}, continuing.`);
                    return;
                }

                const defaultExportCode = this.getDefaultExportCode(exportsPaths, code);
                const chosenThingsToExtend = await this.chooseThingsToExtend(namedExportsData.map(x => x.name), fileName);

                if ([Extendable.route, Extendable.component].includes(this.extendableType) && fileName.includes('component')) {
                    await this.handleStyles();
                }

                // Handle not extending anything in the file
                if (!chosenThingsToExtend?.length) { return; }

                const chosenExports = this.getChosenExports(chosenThingsToExtend, namedExportsData);
                const newFileContents = this.generateNewFileContents({
                    allExports: namedExportsData,
                    chosenExports,
                    defaultExportCode,
                    fileName,
                    originalCode: code
                });

                this.createNewFileWithContents(newFilePath, newFileContents);
            }, Promise.resolve(undefined)
        );

        if (this.lastCreatedFilePath) {
            openFile(this.lastCreatedFilePath);
        }
    }
}

export default async (type: Extendable) => {
    await new Extender(type).process();
};