import js from "@eslint/js"
import stylisticTs from "@stylistic/eslint-plugin-ts"
import ts from "typescript-eslint"
import svelte from "eslint-plugin-svelte"
import globals from "globals"

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    ...ts.configs.recommended,
    ...svelte.configs["flat/recommended"],
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        files: ["**/*.svelte"],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
            },
        },
    },
    {
        ignores: [
            "build/",
            ".svelte-kit/",
            ".vercel",
            "dist/",
            "css/",
            "src/lib/queries.ts",
            "svelte-ts/",
        ],
    },
    {
        files: ["*.ts"],
        plugins: {
            "@stylistic/ts": stylisticTs,
            // "@svelte-ts": sveltets,
        },
        rules: {
            "@stylistic/ts/indent": ["error", 4],
            "@stylistic/ts/object-property-newline": ["error", {
                "allowAllPropertiesOnSameLine": true,
            }],
            "@stylistic/ts/object-curly-newline": ["error", {
                "ObjectExpression": {
                    "multiline": true,
                    "consistent": true,
                    "minProperties": 3,
                },
                "ObjectPattern": {
                    "multiline": true,
                    "consistent": true,
                    "minProperties": 3,
                },
                "ImportDeclaration": "never",
            }],
        },

    },
    // {
    //     files: ["*.ts"],
    //     rules: {
    //         "@stylistic/ts/indent": ["error", 4],
    //     },
    // },
    {
        rules: {
            "arrow-parens": [
                "error",
                "as-needed",
                { requireForBlockBody: false },
            ],
            "no-constant-condition": ["error", { checkLoops: false }],
            "no-implicit-coercion": [
                "error",
                {
                    allow: ["!!"],
                    string: true,
                    number: true,
                    disallowTemplateShorthand: true,
                },
            ],
            // disallow semi-colon
            semi: ["error", "never"],
            quotes: ["error", "double"],
            "array-element-newline": ["error", "consistent"],
            "no-self-assign": "off",
            // "indent": ["error", 4, { "SwitchCase": 1 }],
            "no-empty": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrors: "none",
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports" },
            ],
            "svelte/indent": [
                "error",
                {
                    indentScript: false,
                    indent: 4,
                },
            ],
            "svelte/prefer-style-directive": ["error"],
            "svelte/sort-attributes": ["error"],
            "svelte/shorthand-directive": [
                "error",
                {
                    prefer: "never",
                },
            ],
            "svelte/no-spaces-around-equal-signs-in-attribute": ["error"],
            "svelte/html-quotes": [
                "error",
                {
                    prefer: "double",
                    dynamic: {
                        quoted: false,
                        avoidInvalidUnquotedInHTML: false,
                    },
                },
            ],
            "svelte/no-at-html-tags": "warn",
            "svelte/mustache-spacing": [
                "error",
                {
                    textExpressions: "always", // or "always"
                    attributesAndProps: "never", // or "always"
                    directiveExpressions: "always", // or "always"
                    tags: {
                        openingBrace: "never",
                        closingBrace: "never",
                    },
                },
            ],
            "svelte/block-lang": [
                "error",
                {
                    script: "ts",
                },
            ],
            "svelte/max-attributes-per-line": [
                "error",
                {
                    multiline: 1,
                    singleline: 1,
                },
            ],
            "svelte/first-attribute-linebreak": [
                "error",
                {
                    multiline: "below", // or "beside"
                    singleline: "beside", // "below"
                },
            ],
            "no-undef": "off",
            "svelte/restrict-mustache-expressions": "off",
        },
    },
]
