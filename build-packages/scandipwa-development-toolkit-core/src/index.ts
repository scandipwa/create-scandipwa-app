export * from './types';

import create from './create';
import extend from './extend';

import { getRelativeResourceDirectory } from './extend/fs-interactions';

export { 
    create,
    extend,
    getRelativeResourceDirectory
};
