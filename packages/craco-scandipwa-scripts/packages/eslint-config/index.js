module.exports = {
    "extends": [
        "airbnb",
        "plugin:array-func/recommended"
    ],
    "env": {
        "browser": true
    },
    "parser": "babel-eslint",
    "globals": {
        "window": true,
        "document": true,
        "sessionStorage": true,
        "localStorage": true,
        "jest": true,
        "__": true,
        "workbox": true,
        "importScripts": true
    },
    "plugins": [
        "@scandipwa/scandipwa-guidelines",
        "simple-import-sort",
        "import",
        "react",
        "import",
        "jest",
        "babel",
        "fp"
    ],
    "overrides": [
        {
            "files": ["*.config.js"],
            "rules": {
                "@scandipwa/scandipwa-guidelines/create-config-files": "off"
            }
        }
    ],
    "rules": {
        "@scandipwa/scandipwa-guidelines/file-structure": "error",
        "@scandipwa/scandipwa-guidelines/only-one-class": "error",
        "@scandipwa/scandipwa-guidelines/derived-class-names": "error",
        "@scandipwa/scandipwa-guidelines/use-named-export": "error",
        "@scandipwa/scandipwa-guidelines/create-config-files": "error",
        "simple-import-sort/sort": ["error", {
            "groups": [
                ["^\\u0000"], // side effect imports
                ["^@?[a-z]"], // anything that starts with @ and lowercase
                ["^[^.]"], // anything but a dot
                ["^\\."] // starting with dot
            ]
        }],
        "sort-imports": "off",
        "import/order": "off",
        "import/no-cycle": ["error", {
            "maxDepth": 4
        }],
        "fp/no-let": "error",
        "fp/no-arguments": "error",
        "fp/no-loops": "error",
        "fp/no-delete": "error",
        "no-var": "error",
        "css-rcurlyexpected": 0,
        "react/static-property-placement": ["error", "static public field"],
        "react/jsx-props-no-spreading": "off",
        "react/state-in-constructor": "off",
        "no-restricted-globals": ["error", "isFinite", "isNaN"],
        "max-len": [2, {
            "ignoreComments": true,
            "ignoreUrls": true,
            "code": 120
        }],
        "jest/no-disabled-tests": "warn",
        "jest/no-focused-tests": "error",
        "jest/no-identical-title": "error",
        "jest/prefer-to-have-length": "warn",
        "jest/valid-expect": "error",
        "no-shadow": 0,
        "class-methods-use-this": 0,
        "camelcase": 0,
        "no-underscore-dangle": "off",
        "template-curly-spacing": "off",
        "computed-property-spacing": "off",
        "import/no-unresolved": 0,
        "import/named": 0,
        "no-plusplus": 0,
        "react/react-in-jsx-scope": 0,
        "react/jsx-curly-spacing": [2, {"when": "always", "allowMultiline": false, "children": true} ],
        "import/no-named-as-default": 0,
        "import/no-named-as-default-member": 0,
        // "react/jsx-max-depth": [2, { "max": 2 }],
        "react/jsx-no-useless-fragment": [2, { "max": 2 }],
        "curly": [2, "all"],
        "brace-style": [2, "1tbs", { "allowSingleLine": false }],
        "react/sort-comp": [2, {
            "order": [
                "type-annotations",
                "static-variables",
                "static-methods",
                "instance-variables",
                "lifecycle",
                "everything-else",
                "render"
            ]
        }],
        "react/jsx-filename-extension": 0,
        "react/prefer-stateless-function": 0,
        "react/button-has-type": 0,
        "react/jsx-indent": 0,
        "react/jsx-indent-props": 2,
        "react/jsx-no-bind": [2, {
            "ignoreDOMComponents": false,
            "ignoreRefs": true,
            "allowArrowFunctions": false,
            "allowFunctions": false,
            "allowBind": false
        }],
        "react/forbid-prop-types": [2, {"forbid": ["className"]}],
        "react/forbid-component-props": [2, {"forbid": ["className"]}],
        "react/forbid-dom-props": [2, {"forbid": ["className"]}],
        "react/no-deprecated": 2,
        "babel/semi": 1,
        "new-cap": ["error", { "newIsCap": true }],
        "no-param-reassign": ["error", { "props": true, "ignorePropertyModificationsFor": ["acc", "sum"] }],
        "no-magic-numbers": ["error", { "ignore": [1, 0, 2, -1] }],
        "indent": [
        "error",
        4,
        {
            "ignoredNodes": ["JSXElement","JSXElement > *","JSXAttribute","JSXIdentifier","JSXNamespacedName","JSXMemberExpression","JSXSpreadAttribute","JSXExpressionContainer","JSXOpeningElement","JSXClosingElement","JSXText","JSXEmptyExpression","JSXSpreadChild"]
        }
        ],
        "comma-dangle": [
        "error",
        "never"
        ],
        "no-case-declarations": "off",
        "jsx-a11y/label-has-for": 0,
        "padding-line-between-statements": [
            "error",
            { "blankLine": "always", "prev": ["const", "let", "var"], "next": "*" },
            { "blankLine": "any", "prev": ["const", "let", "var"], "next": ["const", "let", "var"] },
            { "blankLine": "always", "prev": ["block", "block-like", "multiline-block-like", "multiline-expression", "multiline-const", "multiline-let", "multiline-var"], "next": "return" },
            { "blankLine": "any", "prev": ["singleline-const", "singleline-let", "singleline-var"], "next": "*" }
        ],
        "prefer-destructuring": ["error", {
            "array": false,
            "object": true
        }, {
            "enforceForRenamedProperties": false
        }],
        "lines-between-class-members": ["error", "always"],
        "no-extra-semi": "error"
    }
};