const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/use-namespace.js");

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015, sourceType: "module" },
    env: {
        es6: true,
    },
});

ruleTester.run("use-namespace", rule, {
    valid: [
        {
            code: "/** @namespace TestPackage/Test/Path/HeaderComponent */ export class HeaderComponent {}",
        },
    ],

    invalid: [
        {
            code: "export class HeaderComponent {}",
            output: "/** @namespace TestPackage/Test/Path/HeaderComponent */\n" +
                "export class HeaderComponent {}",
            errors: 1,
        },
        {
            code: "/** @namespace The/Wrong/Namespace/HeaderComponent */ export class HeaderComponent {}",
            output: "/** @namespace TestPackage/Test/Path/HeaderComponent */ export class HeaderComponent {}",
            errors: 1,
        },
        {
            code: "/** @namespace TestPackage/Test/Path/WrongExportName */ export class HeaderComponent {}",
            output: "/** @namespace TestPackage/Test/Path/HeaderComponent */ export class HeaderComponent {}",
            errors: 1,
        },
        {
            code: "/**\n" +
                "Some documentation comment\n" +
                "*/\n" +
                "export class HeaderComponent {}",
            output: "/**\n" +
                "Some documentation comment\n" +
                "* @namespace TestPackage/Test/Path/HeaderComponent\n" +
                " */\n" +
                "export class HeaderComponent {}",
            errors: 1,
        },
        {
            code: "export const mapStateToProps = () => {};",
            output: "/** @namespace TestPackage/Test/Path/mapStateToProps */\n" +
                "export const mapStateToProps = () => {};",
            errors: 1,
        },
    ],
});
