# Create ScandiPWA app

## Before you start

1. Make sure `yarn` is installed on your local system. If not, follow [official installation guide](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
2. Make sure to enable "workspaces" in Yarn configuration: `yarn config set workspaces-experimental true`

## Development

1. Run `yarn`, wait until it completes installing dependencies
2. Bootstrap project: `yarn bootstrap`
3. Enter folder with `cd runtime-packages/test` and run `yarn start`

## Magento-like build

1. To build the Project in Magento mode, go to `cd package/test`
2. Run build in Magento mode - `yarn build --magento`.

## Supported features

1. Setup ScandiPWA using generator
2. Run in development with blazing-fast create-react-app based bootstrap
3. Build into Magento theme with `--magento` command
4. Validate `composer.json` to include package-requested dependencies

## Features TODO:

- In Magento mode, generate PUBLIC_URL automatically from `theme.xml`
- Deal with service-worker, find a way to change it
- Implement PHP-based application serving (to work with M2)
- Fix port is allocated issue (app does not self-restart)

> **IMPORTANT**: add notice for not enabled, but used extensions

- Implement custom logger (after compile)
- Add support for TypeScript in ESLint
- Move eslint dependencies to the plugin module

## Publish instructions

- Run `yarn compile:lockfile`, commit result
- Run `lerna publish`

## Version 3 support changes

### No more `scandipwa.json` file

The file `scandipwa.json` has been moved and merged with `package.json`. Now, you must use `scandipwa` field inside `package.json`. What fields are avilable there?

- `parentTheme` **[optional]** - specify which NPM package is a parent theme of your package.
- `themeAlias` **[optional]** - specify which alias to use, if your theme is installed as parent theme. In example, core theme has an alias `Source`.
- `composer` **[optional]** - specify composer dependencies, the root package will be validate to incude the proper version, use format: `"<COMPOSER PACKAGE NAME>": "<VALID SEMVER RANGE>"`.
- `extensions` **[optional]** - specify a list of packages to be used as extensions. You can enable and disable (overriding parent theme values), use format: `"<NPM PACKAGE NAME>": true`.
- `provide` **[optional]** - the provisioned paths. This is useful if extension implements an entry-point file (`src/index.js`, `src/registerServiceWorker.js`) or any other path, discoverable by fallback mechanism.
- `preference` **[optional]** - define a module to "preference" (by specifying preference, you make program use your module instead of preference). Commonly used to implement `@virtual-module` modules.
- `build` **[optional]** - the configuration for the build. Extension can modify webpack configuration and run some scripts before the application start-up. The allowed fields inside are: `before` relative path to function to run before the build, and the `cracoPlugins` - an array of relative path to script.