import * as path from 'path';
import { ResourceType } from '../types';

import {
    FileInformation,
    ExportType,
    StylesOption,
    ExportData
} from '../types/extend-component.types';

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
const isMapping = (name: string) => ['mapStateToProps', 'mapDispatchToProps'].includes(name);

const generateAdditionalImportString = (originalCode: string, defaultExportCode?: string): string => {
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

const generateStyleImport = (
    fileName: string, 
    generableName: string,
    extendableType: ResourceType, 
    chosenStylesOption: StylesOption
): string => {
    if (
        [ResourceType.Route, ResourceType.Component].includes(extendableType)
        && fileName.includes('component')
    ) {
        switch (chosenStylesOption) {
        case StylesOption.extend:
            return `import '${generableName}.style.override'`;

        case StylesOption.override:
        default:
            return `import '${generableName}.style'`;
        }
    }

    return '';
};

const generateImportString = (
    sourceFilePath: string, 
    chosenExports: ExportData[], 
    notChosenExports: ExportData[]
): string => {
    if (!chosenExports.length) {
        return '';
    }

    return 'import {\n'
        .concat(chosenExports.map(({ name }) => `    ${name} as Source${capitalize(name)},\n`).join(''))
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

const generateClassExtend = (chosenExports: ExportData[]): string => {
    const classExport = chosenExports.find(one => one.type === ExportType.class);
    if (!classExport) {
        return '';
    }

    return `export class ${classExport.name} extends Source${classExport.name} {\n`
        + '    // TODO implement logic\n'
        + '};';
};

const generateMappingsExtends = (chosenExports: ExportData[]): Array<string> => {
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

const generateExtendStrings = (chosenExports: ExportData[]): Array<string> => {
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

/**
 * Generate all necessary contents for the created file
 */
const generateNewFileContents = ({ 
    fileName, 
    allExports, 
    chosenExports, 
    defaultExportCode, 
    originalCode,
    resourceType: extendableType,
    resourceName: extendableName,
    chosenStylesOption
}: FileInformation) : string => {
    const generableName = fileName.slice(0, fileName.lastIndexOf('.'));
    const sourceFilePath = path.join(
        `Source${extendableType}`,
        extendableName,
        generableName
    );

    const notChosenExports = allExports.filter(
        one => !chosenExports.includes(one)
    );

    // Generate new file: imports + exports from source + all extendables + class template + exdf
    const result = [
        generateAdditionalImportString(originalCode, defaultExportCode),
        generateImportString(sourceFilePath, chosenExports, notChosenExports),
        generateStyleImport(fileName, generableName, extendableType, chosenStylesOption),
        generateExportsFromSource(notChosenExports),
        ...generateExtendStrings(chosenExports),
        ...generateMappingsExtends(chosenExports),
        generateClassExtend(chosenExports),
        defaultExportCode
    ].filter(Boolean).join('\n\n').concat('\n');

    return result;
};

export default generateNewFileContents;