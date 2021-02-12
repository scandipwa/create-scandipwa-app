import { extend, ResourceType } from "@scandipwa/scandipwa-development-toolkit-core";

import { getSourceModule, getTargetModule } from "../../options/module-selection";
import { ActionType } from "../../types";
import { openFile } from "../../util/file";
import logger from "../../util/logger";
import ui from '../../util/ui';
import { getResourceName } from "../common/options";

export const extender = (resourceType: ResourceType) => async () => {
    const resourceName = await getResourceName(resourceType, ActionType.Extend);
    if (resourceName === null) {
        return;
    }

	const targetModule = await getTargetModule(false);
    if (targetModule === null) {
        return;
    }

	const sourceModule = await getSourceModule(true);
    if (sourceModule === null) {
        return;
    }

    const createdFiles = await extend(
        resourceType,
        resourceName,
        targetModule as string,
        logger,
        ui,
        sourceModule,
    );

    if (createdFiles.length) {
        openFile(createdFiles[0]);
    }
};