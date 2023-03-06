const { join } = require("node:path");

module.exports = {
    extends: [
        join(__dirname, "..", "..", ".eslintrc.cjs"),
        "plugin:expect-type/recommended"
    ],
    root: true,
    plugins: [
        "expect-type"
    ]
};
