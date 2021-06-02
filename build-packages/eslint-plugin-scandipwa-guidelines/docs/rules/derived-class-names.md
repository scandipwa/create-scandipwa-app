# Class name must match the name of the file it is declared in. (derived-class-names)

Class names need to be based on the file name. For example, a class declared in `Footer.component.js` must be named
 `FooterComponent`.

Examples of **incorrect** code for this rule:

```js
// in Goodbye.component.js
class HelloComponent {} // should be GoodbyeComponent

// in Footer.container.js
class FooterComponent {} // should be FooterContainer

// in Hello.component.js
class Hello {} // should be HelloComponent
```

Examples of **correct** code for this rule:

```js
// in Footer.component.js
class FooterComponent {}

// in Footer.container.js
class FooterContainer {}
```

## Why?
Naming classes according to the filename helps keep class names consistent and predictable across the codebase.

## Note
Currently, some code in the Scandi core codebase does not follow this rule. However, all new code should adhere to it.
