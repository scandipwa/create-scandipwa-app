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
2. Run build in Magento mode - `PUBLIC_URL='<public path>' yarn build --magento`.

    > **Note**: the public path can be something like this: `/static/version1598355124/frontend/Scandiweb/pwa/en_US`.


## Known issues

- Fonts (public folder) content can not be overridden, as the are not resolved in compilation (runtime only)

