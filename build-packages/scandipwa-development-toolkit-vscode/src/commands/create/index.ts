import { create, ResourceType } from "@scandipwa/scandipwa-development-toolkit-core";

import { ActionType } from '../../types';
import { getTargetModule } from "../../options/module-selection";
import { getResourceParams } from './options';
import logger from '../../util/logger';
import { handlePossibleError } from "../../util/error-handling";
import { openFile } from "../../util/file";

export const creator = (resourceType: ResourceType) => handlePossibleError(async () => {
	const resourceParams = await getResourceParams(resourceType, ActionType.Create);
	const targetModule = await getTargetModule(false);

	const createdFiles = await create(
		resourceType, 
		resourceParams.resourceName, 
		resourceParams, 
		targetModule!, 
		logger
	);

	if (createdFiles.length) {
		openFile(createdFiles[0]);
	}
});
