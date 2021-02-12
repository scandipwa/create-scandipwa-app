import { selectDirectoryWithHistory } from '../util/cwd';
import { getScandipwaModulesOfWorkspace } from '../util/cwd/workspace';

export const SOURCE_MODULE = 'sourceModule';
export const TARGET_MODULE = 'targetModule';

const SOURCE_MODULE_DESCRIPTION = 'source';
const TARGET_MODULE_DESCRIPTION = 'target';

const getModule = async (
    description: string, 
    moduleKey: string,
    isSkippable?: boolean
): Promise<string | null | undefined> => {
    const additionalHistoryEntries = getScandipwaModulesOfWorkspace();

    const modulePath = await selectDirectoryWithHistory(
        `Select ${description} module`,
        moduleKey,
        isSkippable,
        additionalHistoryEntries
    );

    if (!modulePath && !isSkippable) {
        throw new Error(`A ${description} module must have been selected!`);
    }

    return modulePath;
}

export const getTargetModule = (isSkippable?: boolean) => getModule(
    TARGET_MODULE_DESCRIPTION, 
    TARGET_MODULE, 
    isSkippable
);

export const getSourceModule = (isSkippable?: boolean) => getModule(
    SOURCE_MODULE_DESCRIPTION, 
    SOURCE_MODULE, 
    isSkippable
);