import * as path from 'path';
import { ResourceType } from '../types';

import {
    FileInformation,
    ExportType,
    StylesOption,
    ExportData
} from '../types/extend-component.types';

import { getPackageJson } from '@scandipwa/scandipwa-dev-utils/package-json';

import { getStyleFileName } from './scss-generation';

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
const decapitalize = (word: string) => word.charAt(0).toLowerCase() + word.slice(1);
const isMapping = (name: string) => ['mapStateToProps', 'mapDispatchToProps'].includes(name);

const getModuleAlias = (sourceModule: string) => {
    const { 
        scandipwa: { 
            type,         
            themeAlias 
        } 
    } = getPackageJson(sourceModule);

    // TODO catch this
    // Handle no module type in the base module
    if (!type) {
        throw new Error('No package type found in the base module!');
    }

    // Handle no theme alias in a theme
    if (type === 'theme' && !themeAlias) {
        throw new Error('No theme alias found in the base module!');
    }

    if (type !== 'theme') {
        return 'Base';
    }

    return themeAlias;
}

const getPrefixedName = (name: string, moduleAlias: string) => {
    const isCapitalized = (word: string) => word[0].toUpperCase() === word[0];
    const isUpperCase = (word: string) => word.toUpperCase() === word;


    if (isUpperCase(name)) {
        return `${moduleAlias.toUpperCase()}_${name}`;
    }

    if (isCapitalized(name)) {
        return [moduleAlias, name].map(capitalize).join('');
    }

    return [decapitalize(moduleAlias), capitalize(name)].join('');
}

const generateAdditionalImportString = (originalCode: string, defaultExportCode?: string): string => {
    if (!defaultExportCode) { 
        return ''; 
    }

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

const generateStyleImport = (
    fileName: string, 
    resourceName: string,
    extendableType: ResourceType, 
    chosenStylesOption: StylesOption
): string => {
    if (
        [ResourceType.Route, ResourceType.Component].includes(extendableType)
        && fileName.includes('component')
        && chosenStylesOption !== StylesOption.keep
    ) {
        const styleFilename = getStyleFileName(resourceName, chosenStylesOption).replace(/\.s?(c|a)ss$/, '');

        return `import '${styleFilename}';`;
    }

    return '';
};

const generateImportString = (
    sourceFilePath: string,
    sourceModuleAlias: string,
    chosenExports: ExportData[], 
    notChosenExports: ExportData[]
): string => {
    if (!chosenExports.length) {
        return '';
    }

    return 'import {\n'
        .concat(chosenExports.map(
            ({ name }) => `    ${name} as ${getPrefixedName(name, sourceModuleAlias)},\n`).join('')
        )
        .concat(notChosenExports.map(({ name }) => `    ${name},\n`).join(''))
        .concat(`} from \'${sourceFilePath}\';`);
};

const generateExportsFromSource = (notChosenExports: ExportData[]): string => {
    if (!notChosenExports.length) {
        return '';
    }

    return 'export {\n'
        .concat(notChosenExports.map(({ name }) => `    ${name},\n`).join(''))
        .concat('};');
};

const generateClassExtend = (chosenExports: ExportData[], sourceModuleAlias: string): string => {
    const classExport = chosenExports.find(one => one.type === ExportType.class);
    if (!classExport) {
        return '';
    }

    const { name } = classExport;

    return `export class ${name} extends ${getPrefixedName(name, sourceModuleAlias)} {\n`
        + '    // TODO implement logic\n'
        + '};';
};

const generateMappingsExtends = (chosenExports: ExportData[], sourceModuleAlias: string): Array<string> => {
    return chosenExports
        .filter(({ name }) => isMapping(name))
        .map(
            ({ name }) => {
                const argument = name.includes('State')
                    ? 'state'
                    : 'dispatch';

                const newExport =
                    `export const ${name} = ${argument} => ({\n` +
                    `    ...${getPrefixedName(name, sourceModuleAlias)}(${argument}),\n` +
                    `    // TODO extend ${name}\n` +
                    `});`;

                return newExport;
            }
        );
};

const generateExtendStrings = (chosenExports: ExportData[], sourceModuleAlias: string): Array<string> => {
    if (!chosenExports.length) {
        return [];
    }

    return chosenExports
        .filter(one => one.type !== ExportType.class && !isMapping(one.name))
        .map(({ name }) =>
            `//TODO: implement ${name}\n`
            + `export const ${name} = ${getPrefixedName(name, sourceModuleAlias)};`
        );
};

/**
 * Generate all necessary contents for the created file
 */
const generateNewFileContents = ({ 
    fileName, 
    allExports, 
    chosenExports, 
    defaultExportCode, 
    originalCode,
    resourceType,
    resourceName,
    sourceModule,
    chosenStylesOption
}: FileInformation) : string => {
    const sourceFileImportPath = path.join(
        `Source${capitalize(resourceType)}`,
        resourceName,
        fileName.slice(0, fileName.lastIndexOf('.'))
    );

    const notChosenExports = allExports.filter(
        one => !chosenExports.includes(one)
    );

    const sourceModuleAlias = getModuleAlias(sourceModule);

    // Generate new file: imports + exports from source + all extendables + class template + exdf
    const result = [
        generateAdditionalImportString(originalCode, defaultExportCode),
        generateImportString(sourceFileImportPath, sourceModuleAlias, chosenExports, notChosenExports),
        generateStyleImport(fileName, resourceName, resourceType, chosenStylesOption),
        generateExportsFromSource(notChosenExports),
        ...generateExtendStrings(chosenExports, sourceModuleAlias),
        ...generateMappingsExtends(chosenExports, sourceModuleAlias),
        generateClassExtend(chosenExports, sourceModuleAlias),
        defaultExportCode
    ].filter(Boolean).join('\n\n').concat('\n');

    return result;
};

export default generateNewFileContents;