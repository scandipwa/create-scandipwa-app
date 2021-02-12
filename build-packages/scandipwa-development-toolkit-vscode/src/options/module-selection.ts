import { selectModuleWithHistory } from '../util/cwd';

export const SOURCE_MODULE = 'sourceModule';
export const TARGET_MODULE = 'targetModule';

const SOURCE_MODULE_DESCRIPTION = 'source';
const TARGET_MODULE_DESCRIPTION = 'target';

const getModule = async (
    description: string, 
    moduleKey: string,
    skipOption?: string,
    additionalHistoryEntries?: string[],
    allowedModuleTypes?: string[]
): Promise<string | null | undefined> => {
    const modulePath = await selectModuleWithHistory(
        `Select ${description} module`,
        moduleKey,
        skipOption,
        additionalHistoryEntries,
        allowedModuleTypes
    );

    if (!modulePath && !skipOption) {
        throw new Error(`A ${description} module must have been selected!`);
    }

    return modulePath;
}

export const getTargetModule = (
    additionalHistoryEntries?: string[],
    allowedModuleTypes?: string[]
) => getModule(
    TARGET_MODULE_DESCRIPTION, 
    TARGET_MODULE, 
    undefined,
    additionalHistoryEntries,
    allowedModuleTypes
);

export const getSourceModule = (
    isSkippable?: boolean,
    additionalHistoryEntries?: string[]
) => getModule(
    SOURCE_MODULE_DESCRIPTION, 
    SOURCE_MODULE, 
    isSkippable ? 'Determine by Fallback plugin' : undefined,
    additionalHistoryEntries
);