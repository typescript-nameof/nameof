const { join } = require("node:path");

module.exports = {
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.app.json"),
            join(__dirname, "tsconfig.macro.json"),
            join(__dirname, "tsconfig.eslint.json"),
            join(__dirname, "src", "tests", "tsconfig.json")
        ]
    },
    ignorePatterns: [
        "macro/*.cjs",
        "macro/*.d.cts"
    ]
};
