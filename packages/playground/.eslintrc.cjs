const { join } = require("node:path");

module.exports = {
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.app.json"),
            join(__dirname, "tsconfig.editor.json"),
            join(__dirname, "tsconfig.eslint.json")
        ]
    }
};
