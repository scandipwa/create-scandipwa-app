import { selectDirectoryWithHistory } from '../util/cwd';

export const SOURCE_MODULE = 'sourceModule';
export const TARGET_MODULE = 'targetModule';

const SOURCE_MODULE_DESCRIPTION = 'source';
const TARGET_MODULE_DESCRIPTION = 'target';

const getModule = async (description: string): Promise<string> => {
    const modulePath = await selectDirectoryWithHistory(
        `Please, select ${description} module!`,
        SOURCE_MODULE
    );

    if (!modulePath) {
        throw new Error(`A ${description} module must have been selected!`);
    }

    return modulePath;
}

export const getTargetModule = () => getModule(TARGET_MODULE_DESCRIPTION);

export const getSourceModule = () => getModule(SOURCE_MODULE_DESCRIPTION);