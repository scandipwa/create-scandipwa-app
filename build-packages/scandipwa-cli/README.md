# Scandi CLI
A utility for accelerating development with [Scandi](https://docs.scandipwa.com/)

Example – with one command, create a component template in src/component/HugeTitle:

```
scandipwa create component HugeTitle
```

A [VSC plugin for Scandi CLI](https://marketplace.visualstudio.com/items?itemName=ScandiPWA.scandipwa-development-toolkit-vscode) is also available!

## Installation

Install the npm package globally:

```
npm i -g scandipwa-cli
```

## Usage
Global options:
- `--help` to get usage help
- `--version` to print version number and exit

### `create component`
Creates a new [Scandi component](https://docs.scandipwa.com/structure/building-blocks-summary/components)

Syntax:
```
create component [--container] [--redux] <name>
```

Options:
- `--container`/`-c` creates a container file for the component
- `--redux`/`-r` connects the component to the Redux store with the `connect` HOC
- `name` is the name of the component to be created

Examples:
```
scandipwa create component HugeTitle
# Output:
NOTE!

     The following files have been created:
     src/component/HugeTitle/HugeTitle.component.js
     src/component/HugeTitle/HugeTitle.style.scss
     src/component/HugeTitle/index.js
```
```
scandipwa create component --container SpecialHeader
# Output:
NOTE!

     The following files have been created:
     src/component/SpecialHeader/SpecialHeader.component.js
     src/component/SpecialHeader/SpecialHeader.style.scss
     src/component/SpecialHeader/index.js
     src/component/SpecialHeader/SpecialHeader.container.js
```
### `create route`

Creates a new [Scandi route](https://docs.scandipwa.com/structure/building-blocks-summary/routes)

Syntax:
```
create route [--container] [--redux] <name>
```

Options:
- `--container`/`-c` creates a container file for the route
- `--redux`/`-r` connects the route to the Redux store with the `connect` HOC
- `name` is the name of the route to be created

Example:
```
scandipwa create route MyLandingPage
# Output:
NOTE!

     The following files have been created:
     src/route/MyLandingPage/MyLandingPage.component.js
     src/route/MyLandingPage/MyLandingPage.style.scss
     src/route/MyLandingPage/index.js
```

### `create store`
Creates a new [Scandi Redux store](https://docs.scandipwa.com/structure/building-blocks-summary/redux-stores)

Syntax:
```
create store [--dispatcher-type=<"no"|"regular"|"query">] <name>
```

Options:
- `--dispatcher-type`/`-d` determines what type of dispatcher file will be created.
  - `no` (default) - does not create a dispatcher
  - `regular` - creates a simple helper class for dispatching actions
  - `query` - creates a dispatcher that `extends QueryDispatcher`
- `name` is the name of the store to be created

Example:
```
scandipwa create store --d=query UserPreferences
# Output:
NOTE!

     The following files have been created:
     src/store/UserPreferences/UserPreferences.action.js
     src/store/UserPreferences/UserPreferences.dispatcher.js
     src/store/UserPreferences/UserPreferences.reducer.js
```

### `create query`
Creates a new [Scandi query helper](https://docs.scandipwa.com/structure/building-blocks-summary/constructing-graphql-queries) for querying with GraphQL

Syntax:
```
create query <name>
```

`name` is the name of the query to be created

Example:
```
scandipwa create query Weather
# Output:
NOTE!

     The following files have been created:
     src/query/Weather.query.js
```

### `deploy`
Deploys your app to the cloud

Syntax:

```
deploy
```

Example
```
 scandipwa deploy
yarn run v1.22.5
$ scandipwa-scripts build
Creating an optimized production build...
Build completed in 186.317s

Compiled successfully.
[...]
Done in 189.38s.
Build files compressed successfully.
Code upload result: OK. Code: 200
Build archive successfully removed.
Congrats, your code will be deployed in a few minutes! You can access it here: https://master.d16zgbgmy9fzgx.amplifyapp.com/
```

### `extension install`
Installs a Scandi extension

Syntax:
```
extension install [--no-enable] [--local] [--use=<path>] [--version=<required-version>] [--save-dev] <name>
```

Options:
- `--no-enable` will install the extension without enabling it
- `--local`/`-l`: use a local module from `packages/<name>`
- `--use`/`-u`: use a local module from the specified `<path>`
- `--version`/`-v` specifies the extension version to use
- `save-dev`/`-D`: install the package as a devDependency
- `name` is the name of the extension to install


### `extension create`
Creates a new scandi extension

Syntax:
```
extension create [--no-enable] <name>
```

Options:
- `--no-enable` will create and install the extension without enabling it
- `name` specifies the name of the new extension

### `override component`
Overrides a [Scandi component](https://docs.scandipwa.com/structure/building-blocks-summary/components). Will interactively ask for which parts to override.

Syntax:
```
override component [--styles=<"extend"|"override"|"keep">] [--source-module=<module>] [--target-module=<module>] <name>
```

Options:
- `--styles`/`-S`:
  - Not specified (default): will prompt interactively
  - `keep`: don't override styles
  - `extend`: adjust existing styles
  - `override`: completely replace existing styles
- `--source-module`/`-s`: Path to the module to override the component from
- `--target-module`/`-t`: Path to the module to generate the component in 
- `name` is the name of the component to be overridden

Example:
```
scandipwa override component Header
? Choose things to extend in Header.component.js Header
? What would you like to do with styles? Extend
? Choose things to extend in Header.config.js 
? Choose things to extend in Header.container.js 

NOTE!

     The following files have been created:
     src/component/Header/Header.override.style.scss
     src/component/Header/Header.component.js
```

### `override route`
Overrides a [Scandi route](https://docs.scandipwa.com/structure/building-blocks-summary/routes)

Syntax:
```
override route [--styles=<"extend"|"override"|"keep">] [--source-module=<module>] [--target-module=<module>] <name>
```

Options:
- `--styles`/`-S`:
  - Not specified (default): will prompt interactively
  - `keep`: don't override styles
  - `extend`: adjust existing styles
  - `override`: completely replace existing styles
- `--source-module`/`-s`: Path to the module to override the route from
- `--target-module`/`-t`: Path to the module to generate the route in 
- `name` is the name of the route to be overridden

### `override store`
Overrides a [Scandi Redux store](https://docs.scandipwa.com/structure/building-blocks-summary/redux-stores)

Syntax:
```
override store [--source-module=<module>] [--target-module=<module>] <name>
```

Options:
- `--source-module`/`-s`: Path to the module to override the store from
- `--target-module`/`-t`: Path to the module to generate the store in 
- `name` is the name of the store to be overridden

### `override query`
Overrides a [Scandi query helper](https://docs.scandipwa.com/structure/building-blocks-summary/constructing-graphql-queries)

Syntax:
```
override query [--source-module=<module>] [--target-module=<module>] <name>
```

Options:
- `--source-module`/`-s`: Path to the module to override the query from
- `--target-module`/`-t`: Path to the module to generate the query in 
- `name` is the name of the query to be overridden
