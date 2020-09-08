# Create ScandiPWA app

## Before you start

1. Make sure `yarn` is installed on your local system. If not, follow [official installation guide](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
2. Make sure to enable "workspaces" in Yarn configuration: `yarn config set workspaces-experimental true`

## Development

1. Run `yarn`, wait until it completes installing dependencies
2. Bootstrap project: `yarn bootstrap packages/test`
3. Enter folder with `cd packages/test` and run `yarn start`

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
- Rework initial boot-strapper from YO to custom