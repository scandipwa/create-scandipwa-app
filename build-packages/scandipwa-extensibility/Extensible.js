/* eslint-disable max-classes-per-file */
import generateGetHandler from './lib/handlers/generateGetHandler';

// Key for processable classes to determine whether they are already extensible
const extensible = Symbol('Extensible');
const cacheIdentityKey = Symbol('CacheIdentityKey');

// Cache to optimise class generation
const generated = [];

// eslint-disable-next-line @scandipwa/scandipwa-guidelines/derived-class-names
class EmptyBase {}

export default (BaseClass = EmptyBase) => {
    // NOTE! Base class is original class which class extends

    // Handle already extensible classes
    if (BaseClass[extensible]) {
        return BaseClass;
    }

    const { name } = BaseClass;
    // Get the cache identity for the base class, omit inherited prop
    const {
        // Generate unique cache identities as default value
        value: cacheIdentity = Symbol(`Cache Identity ${name}`)
    } = Object.getOwnPropertyDescriptor(BaseClass, cacheIdentityKey) || {};

    // If such class is not yet generated => generate the class
    if (!generated[cacheIdentity]) {
        /**
         * What this class does, is:
         * - extends what original class did extend
         * - defines a constructor which calls original parent
         */

        const GeneratedClass = class Extensible extends BaseClass {
            constructor(...args) {
                super(...args);
                const { __namespaces__ } = Object.getPrototypeOf(this);

                return new Proxy(this, {
                    get: generateGetHandler('instance', __namespaces__)
                });
            }

            __construct() {}
        };

        GeneratedClass[extensible] = true;
        generated[cacheIdentity] = GeneratedClass;
        Object.defineProperty(
            BaseClass,
            cacheIdentityKey,
            { value: cacheIdentity, writable: false }
        );
    }

    return generated[cacheIdentity];
};
