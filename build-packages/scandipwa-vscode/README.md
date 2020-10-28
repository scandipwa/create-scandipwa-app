# ScandiPWA development toolkit

#### Made to simplify your work with internal components, routes, queries and store.

This extension is a core extension of ScandiPWA extension pack for development in VSCode editor.

> **NOTE**: This extension is in beta, please use with caution and report any issues to ScandiPWA Github.

## Requirements

1. Node 10^ + npm 6.8^
2. VSCode ^1.45

> **NOTE**: Extension might work on previous versions as well, it is not tested.

## How to use?

1. Install node modules

```
npm ci
```

2. Install `vsce` – official extension packaging tool

```
npm i -g vsce
```

3. Pack the extension

```
vsce package
```

4. Open command pallete, type `> Install from VSIX`

5. Choose generated `.vsix` file

### Commands

- ScandiPWA: Create new component
- ScandiPWA: Create new route
- ScandiPWA: Create new query
- ScandiPWA: Create new store
- ScandiPWA: Extend source component
- ScandiPWA: Extend source route
- ScandiPWA: Extend source query
- ScandiPWA: Extend source store

### Configuration

- Path to Scandipwa source (relative), default value:

```
../../../../../vendor/scandipwa/source/
```

### Snippets

When editing JavaScript file type one of the snippet prefixes listed below and press `Tab` to replace keyword with predefined template.

| Prefix      | Template                                 |
| ----------- | ---------------------------------------- |
| **exdf**    | Default export declaration for IndexJS   |
| **comp**    | Creates new ScandiPWA component          |
| **ecomp**   | Extends Source ScandiPWA component       |
| **cont**    | Creates new ScandiPWA container class    |
| **econt**   | Extends Source ScandiPWA container class |
| **con**     | Connects component to redux              |
| **mstp**    | Declares mapStateToProps                 |
| **mdtp**    | Declared mapDispatchToProps              |
| **qc**      | Creates new ScandiPWA query              |
| **eqc**     | Extends ScandiPWA Source query           |
| **eroute**  | Extends ScandiPWA Source Route component |
| **ecroute** | Extends ScandiPWA Source Route container |
| **crd**     | Creates reducer                          |
| **erd**     | Extends ScandiPWA reducer                |
| **cdisp**   | Creates new ScandiPWA dispatcher         |
| **edisp**   | Extends ScandiPWA dispatcher             |
