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

### Create

#### `create component <name>`
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
#### `create route <name>`

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

#### `create store <name>`
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

#### `create query <name>`
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