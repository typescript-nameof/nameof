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
    }
};
