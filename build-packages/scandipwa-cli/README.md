# Scandi CLI
A utlity for accelerating development with [Create Scandipwa App](https://github.com/scandipwa/create-scandipwa-app)

```
scandipwa create component HugeTitle    # creates a component template in src/component/HugeTitle
```

## Installation

Install the npm package globally:

```
npm i -g scandipwa-cli
```

## Usage
Global options:
- `--help` to get usage help
- `--version` to print version number and exit

### Create

#### `create component`
Creates a new Scandi component

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
#### `create route`

Creates a new Scandi route

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

#### `create store`
Creates a new Scandi Redux store

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

#### `create query`
Creates a new Scandi query helper for querying with GraphQL

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

### Deploy
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

### Extension
#### `extension install <name>`
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


#### `extension create <name>`
Creates a new scandi extension

Syntax:
```
extension create [--no-enable] <name>
```

Options:
- `--no-enable` will create and install the extension without enabling it

