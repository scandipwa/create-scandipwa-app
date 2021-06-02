# Plugin endpoints must have a namespace (use-namespace)

Exported functions and classes (as well as some other values) need to be available for extensions to plug into.
To achieve this, they must be decorated by the `@namespace` comment, and the namespace should be correct.

Examples of **incorrect** code for this rule:

```js
// no namespace:
export class HeaderComponent {}
```

```js
/** @namespace The/Wrong/Namespace/HeaderComponent */
export class HeaderComponent {}
```

Examples of **correct** code for this rule:

```js
// in TestPackage, in the file Test/Path:
/** @namespace TestPackage/Test/Path/HeaderComponent */
export class HeaderComponent {}
```

## Why?
Decorating these classes and functions with namepaces ensures that your theme will work correctly with Scandi
 [extensions](https://docs.scandipwa.com/developing-with-scandi/extensions).
