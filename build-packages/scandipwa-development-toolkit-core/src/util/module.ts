import { getPackageJson } from "@scandipwa/common-dev-utils/package-json";
import { ModuleInformation, SourceType } from "../types";

export const getModuleInformation = (sourceModule: string): ModuleInformation => {
    const buildModuleInformationObject = (
        name: string,
        type: SourceType,
        alias: string
    ): ModuleInformation => ({ name, type, alias });

    const { 
        name,
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
    if (type === SourceType.Theme && !themeAlias) {
        throw new Error('No theme alias found in the base module!');
    }

    if (type === SourceType.Extension) {
        return buildModuleInformationObject(name, type, 'Base');
    }

    return buildModuleInformationObject(name, type, themeAlias);
}