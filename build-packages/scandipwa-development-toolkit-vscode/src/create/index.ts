import { create, ResourceType } from "@scandipwa/scandipwa-development-toolkit-core";

import { getTargetModule } from "../options/module-selection";
import { getResourceParams } from '../options/resource-params';
import logger from '../util/logger';
import { handlePossibleError } from "../util/error-handling";

export const creator = (resourceType: ResourceType) => handlePossibleError(async () => {
	const resourceParams = await getResourceParams(resourceType);
	const targetModule = await getTargetModule();

	create(
		resourceType, 
		resourceParams.resourceName, 
		resourceParams, 
		targetModule, 
		logger, 
		() => {}
	);
});
