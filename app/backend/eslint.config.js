import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["dist", "node_modules"],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ["**/*.ts"],

        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
            },
            globals: {
                ...globals.node,
            },
        },

        rules: {
            "no-console": "warn",
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
];