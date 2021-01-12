# @scandipwa/scandipwa-template-plugin-system

This package provides the template plugin system used by [Create Scandipwa App](https://github.com/scandipwa/create-scandipwa-app).

### Abstract

This template plugin system processes the template (the main markup file) file of the application.

It provides an opportunity to modify the template similarly to the process which is provided by CSA to modify the build configuration.

### Use cases

1. Your extension needs some additional HTML/PHP nodes in the template

2. Your extension is incompatible with some existing HTML/PHP nodes in the template and needs to remove them

### Limitations

1. This tool is not meant for PHP code modifications. It offers an opportunity to interact with template as with text, but changing PHP or JS code such way would be considered a misuse, due to possible incompatibilities with a plugin written such a way.

### Dependencies

`xmldom` is used to parse the markup to DOM and parse the DOM to markup. The DOM provided in the API is documented in this package's documentation.

`lodash` is used to process the initial template the same way as the loader of the `HtmlWebpackPlugin` does that.

### How to use

1. Define the paths to the template plugins in your package.json

```json
{
    "scandipwa": {
        "build": {
            "templatePlugins": [
                "build-config/template-modification"
            ]
        }
    },
}
```

2. Use one of the provided APIs to modify the template

3. See the modified template in the compiled version of your project

### API reference

1. `overrideDOM({ dom, parser, serializer }): DOM`

Interact with the DOM representation of the template. This is a __recommended__ way to modify a template using this plugin system.

The DOM is parsed by the `xmldom` package, see [its documentation](https://www.npmjs.com/package/xmldom) for some precise information on the deeper API.

This API covers all of the regular needs: handling the DOM including additional interactions with PHP nodes.

A valid DOM should be returned from this method.

2. `overrideText({ markup }): string`

Interact with the text representation of the template. It is __not recommended__ to use this if you have an opportunity to use the first API.

This API is meant strictly for interaction with template types that are __not supported__ by the first API, e.g. `cshtml`, Razor syntax etc.

A valid markup should be returned from this method.