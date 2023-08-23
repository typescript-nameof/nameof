const { join } = require("node:path");

module.exports = {
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.app.json"),
            join(__dirname, "tsconfig.eslint.json"),
            join(__dirname, "type-tests", "tsconfig.json")
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
