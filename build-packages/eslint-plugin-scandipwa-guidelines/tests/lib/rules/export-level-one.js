const { RuleTester } = require("eslint");
const rule = require("../../../lib/rules/export-level-one.js");

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015, sourceType: "module" },
    env: {
        es6: true,
    },
});

ruleTester.run("export-level-one", rule, {
    valid: [
        {
            code: "export class Header {}",
        },
        {
            code: "export default class Header {}",
        },
        {
            code: "export const FETCH_COUNT = 5;",
        },
        {
            code: "export function formatInput(){}",
        },
        {
            code: "export default function formatInput(){}",
        },
        {
            code: "const {value} = SOME_CONSTANT;",
        }
    ],

    invalid: [
        {
            code: "class Header {}",
            output: "export class Header {}",
            errors: [{ rule: "export-level-one" }],
        },
        {
            code: "const FETCH_COUNT = 5;",
            output: "export const FETCH_COUNT = 5;",
            errors: [{ rule: "export-level-one" }],
        },
        {
            code: "function formatInput(){}",
            output: "export function formatInput(){}",
            errors: [{ rule: "export-level-one" }],
        },
    ],
});
