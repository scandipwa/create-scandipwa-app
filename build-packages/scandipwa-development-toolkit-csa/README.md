# ScandiPWA development toolkit

#### Made to simplify your work with ScandiPWA.

This extension is a core extension of ScandiPWA extension pack for development in VSCode editor.

## Requirements

1. Node 10^ + npm 6.8^
2. VSCode ^1.45

### Commands

- ScandiPWA: Create new component
- ScandiPWA: Create new route
- ScandiPWA: Create new query
- ScandiPWA: Create new store
- ScandiPWA: Extend source component
- ScandiPWA: Extend source route
- ScandiPWA: Extend source query
- ScandiPWA: Extend source store

## How to build manually?

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
