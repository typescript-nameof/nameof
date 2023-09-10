const { join } = require("node:path");

module.exports = {
    parserOptions: {
        project: [
            join(__dirname, "tsconfig.app.json"),
            join(__dirname, "tsconfig.eslint.json"),
            join(__dirname, "type-tests", "tsconfig.json")
        ]
    }
};
