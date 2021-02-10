import { extend, ResourceType } from "@scandipwa/scandipwa-development-toolkit-core";

import { getSourceModule, getTargetModule } from "../../options/module-selection";
import { ActionType } from "../../types";
import logger from "../../util/logger";
import ui from '../../util/ui';
import { getResourceName } from "../common/options";

export const extender = (resourceType: ResourceType) => async () => {
    const resourceName = await getResourceName(resourceType, ActionType.Extend);
	const targetModule = await getTargetModule();
	const sourceModule = await getSourceModule();

    const createdFiles = await extend(
        resourceType,
        resourceName,
        targetModule,
        sourceModule,
        logger,
        ui
    );
};