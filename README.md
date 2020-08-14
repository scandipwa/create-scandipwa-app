# Create ScandiPWA app

## Before you start

1. Make sure `yarn` is installed on your local system. If not, follow [official installation guide](https://classic.yarnpkg.com/en/docs/install/#debian-stable)
2. Make sure to enable "workspaces" in Yarn configuration: `yarn config set workspaces-experimental true`

## Development

1. Run `yarn`, wait until it completes installing dependencies
2. Bootstrap project: `node packages/create-scandipwa-app/lib/index.js test && mv test packages/test`
3. Re-run lerna bootstrap - `yarn`
4. Run `yarn start` and open `http://127.0.0.1:3000` in browser

## Known issues

- Fonts (public folder) content can not be overridden, as the are not resolved in compilation (runtime only)

