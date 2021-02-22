/* eslint-disable no-undef */

/**
 * Determines the global context of the application
 * Returns an empty object when unable to determine properly
 */
export default function getGlobalContext() {
    try {
        // Preferred: universal shorthand property
        if (typeof globalThis !== 'undefined') {
            return globalThis;
        }

        // Legacy support: browsers
        if (typeof window !== 'undefined') {
            return window;
        }

        // Legacy support: node
        if (typeof global !== 'undefined') {
            return global;
        }

        // Legacy support: service workers
        if (typeof ServiceWorkerGlobalScope !== 'undefined') {
            return ServiceWorkerGlobalScope;
        }
    } catch {
        // no-op
    }

    return {};
}
