const { join } = require("node:path");
const { PluginName, PresetName } = require("@manuth/eslint-plugin-typescript");

module.exports = {
    extends: [
        `plugin:${PluginName}/${PresetName.RecommendedWithTypeChecking}`
    ],
    root: true,
    env: {
        node: true,
        es6: true
    },
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.editor.json"),
            join(__dirname, "tsconfig.eslint.json")
        ]
    },
    rules: {
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                args: "none"
            }
        ]
    },
    overrides: [
        {
            files: [
                "*.test-d.ts"
            ],
            rules: {
                "jsdoc/require-jsdoc": "off",
                "@delagen/deprecation/deprecation": "off",
                "@typescript-eslint/naming-convention": "off",
                "@typescript-eslint/no-namespace": "off"
            }
        }
    ]
};
