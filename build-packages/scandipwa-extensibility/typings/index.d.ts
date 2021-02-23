export interface WebpackInjectorConfig {
    // Inject definitions into ProvidePlugin
    provideGlobals: boolean

    // Support util/extensions
    supportLegacy: boolean,

    // If one is sure that his JS modules are parsed despite exclude rules
    // One should set this to true
    disableExcludeWarning: boolean,

    // They may be several entry points for plugins
    // These files will be injected with ExtUtils.setPlugins
    entryMatcher: string | function | RegExp,

    // Instance of webpack that the application uses
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webpack: any
}
