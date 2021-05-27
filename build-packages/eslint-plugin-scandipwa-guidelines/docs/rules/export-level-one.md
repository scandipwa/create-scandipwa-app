# Declarations must be exported (export-level-one)
In Scandi, all top-level declaration need to be [exported](https://javascript.info/import-export). This ensures that
 your code remains extensible. This rule applies to all top-level class, function and constant declarations.

Examples of **incorrect** code for this rule:

```js
class Header {}

const FETCH_COUNT = 5;

function formatInput(){}
```

Examples of **correct** code for this rule:

```js
export class Header {}

export const FETCH_COUNT = 5;

export function formatInput(){}
```

# Why?
Exporting all declarations ensures that your code is easily extensible using the
[Override Mechanism](https://docs.scandipwa.com/developing-with-scandi/override-mechanism). This rule helps ensure
 that your code will work well with the rest of the Scandi ecosystem.
