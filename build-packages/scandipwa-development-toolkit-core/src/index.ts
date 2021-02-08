export * from './types';

import locateScandipwaModule from './util/locate-scandipwa';

import create from './create';
import extend from './extend';

import { getRelativeResourceDirectory } from './extend/fs-interactions';

export { 
    create,
    extend,
    locateScandipwaModule,
    getRelativeResourceDirectory
};
