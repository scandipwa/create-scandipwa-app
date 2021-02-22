/* eslint-disable
    no-console,
    max-classes-per-file
*/

import { cacheIdentityKey, EmptyBase, extensible } from './lib/extensible/constants';
import generateApplyHandler from './lib/handlers/apply';
import generateConstructHandler from './lib/handlers/construct';
import generateGetHandler from './lib/handlers/get';
import generateMiddlewaredClass from './lib/middleware/class';
import addNamespaceToMiddlewarable from './lib/namespace/add-namespace-to-middlewarable';
import getNamespacesFromMiddlewarable from './lib/namespace/get-namespaces-from-middlewarable';
import pluginStorage from './lib/plugins/plugin-storage';

class ExtUtils {
    constructor() {
        // Plugins' storage, ex: window.plugins
        this.plugins = {};

        // Cache to optimise class generation
        this.generated = [];
    }

    setPlugins(importArray) {
        pluginStorage.setPlugins(importArray);
    }

    Extensible(BaseClass = EmptyBase) {
        // NOTE! Base class is original class which class extends

        // Handle already extensible classes
        if (BaseClass[extensible]) {
            return BaseClass;
        }

        const { name } = BaseClass;
        const {
            // Generate unique cache identities as default value
            value: cacheIdentity = Symbol(`Cache Identity ${name}`)
        } = Object.getOwnPropertyDescriptor(BaseClass, cacheIdentityKey) || {};

        const getGetHandler = (__namespaces__) => generateGetHandler('instance', __namespaces__);

        // If such class is not yet generated => generate the class
        if (!this.generated[cacheIdentity]) {
            /**
             * What this class does, is:
             * - extends what original class did extend
             * - defines a constructor which calls original parent
             */

            const GeneratedClass = class Extensible extends BaseClass {
                constructor(...args) {
                    super(...args);
                    const { __namespaces__ } = Object.getPrototypeOf(this);
                    const getHandler = getGetHandler(__namespaces__);
                    return new Proxy(this, { get: getHandler });
                }

                __construct() {}
            };

            GeneratedClass[extensible] = true;
            this.generated[cacheIdentity] = GeneratedClass;
            Object.defineProperty(
                BaseClass,
                cacheIdentityKey,
                { value: cacheIdentity, writable: false }
            );
        }

        return this.generated[cacheIdentity];
    }

    middleware(Middlewarable, namespace) {
        try {
            addNamespaceToMiddlewarable(Middlewarable, namespace);

            const handler = {
                // Get handler for members - intercepts `get` calls, meant for class static members
                get: generateGetHandler('class', getNamespacesFromMiddlewarable(Middlewarable)),

                // Apply handler for functions - intercepts function calls
                apply: generateApplyHandler(getNamespacesFromMiddlewarable(Middlewarable)),

                // Construct handler for classes - intercepts `new` operator calls, changes properties
                construct: generateConstructHandler(getNamespacesFromMiddlewarable(Middlewarable))
            };

            const proxy = new Proxy(Middlewarable, handler);

            // TODO check if class
            return generateMiddlewaredClass(proxy);
        } catch (e) {
            console.log(`Failed to apply middleware to: ${ Middlewarable } (${ namespace }).`);
            console.log(e);

            return Middlewarable;
        }
    }
}

export default new ExtUtils();
