import getGlobalContext from '../context/get-global-context';
import generateConfig from './generate-config';

class PluginStorage {
    constructor() {
        this.plugins = [];
    }

    setPlugins(importArray) {
        this.plugins = generateConfig(importArray);

        // Expose this.plugins to the global context
        // For debugging convenience; this is not used in the code
        getGlobalContext().plugins = this.plugins;
    }
}

export default new PluginStorage();
