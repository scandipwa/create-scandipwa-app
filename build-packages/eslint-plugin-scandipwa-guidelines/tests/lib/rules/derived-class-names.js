/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable scandipwa-extensibility/no-non-extensible-components */

const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/derived-class-names");

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015, sourceType: "module" },
    env: {
        es6: true,
    },
});
ruleTester.run("derived-class-names", rule, {
    valid: [
        {
            code: "class Anything {}",
            filename: "Hello.js",
        },
        {
            code: "class FooterComponent {}",
            filename: "Footer.component.js",
        },
        {
            code: "class MyTest {}",
            filename: "my.test.js",
        },
    ],

    invalid: [
        {
            code: "class HelloComponent {}",
            filename: "Goodbye.component.js",
            output: "class GoodbyeComponent {}",
            errors: [{ rule: "derived-class-names" }],
        },
        {
            code: "export class FooterComponent {}",
            filename: "Footer.container.js",
            output: "export class FooterContainer {}",
            errors: [{ rule: "derived-class-names" }],
        },
        {
            code: "class Test {} export default Test;",
            filename: "my.test.js",
            output: "class MyTest {} export default MyTest;",
            errors: [{ rule: "derived-class-names" }, { rule: "derived-class-names" }],
        },
        {
            code: "class Food {} export default connect(null, null)(Food);",
            filename: "Food.container.js",
            output: "class FoodContainer {} export default connect(null, null)(FoodContainer);",
            errors: [{ rule: "derived-class-names" }, { rule: "derived-class-names" }],
        },
        {
            code: "import { Logo as BaseLogo } from 'SourceComponent/Logo/Logo.component'; class Logo {}",
            filename: "Logo.component.js",
            output: "import { Logo as BaseLogo } from 'SourceComponent/Logo/Logo.component'; class LogoComponent {}",
            errors: [{ rule: "derived-class-names" }],
        },
    ],
});
