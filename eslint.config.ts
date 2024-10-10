import { join } from "node:path";
import { flatConfigs } from "@manuth/eslint-plugin-typescript";
import globals from "globals";

export default [
    ...flatConfigs.recommendedWithTypeChecking,
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.es5
            },
            parserOptions: {
                project: [
                    ["tsconfig.editor.json"],
                    ["tsconfig.eslint.json"],
                    ...[
                        ...[
                            ["tsconfig.app.json"],
                            ["tsconfig.macro.json"],
                            ["tsconfig.eslint.json"],
                            ["src", "tests", "tsconfig.json"]
                        ].map((path) => ["babel", ...path]),
                        ...[
                            ["tsconfig.app.json"],
                            ["tsconfig.eslint.json"],
                            ["src", "tests", "tsconfig.json"]
                        ].map((path) => ["common", ...path]),
                        ...[
                            ["tsconfig.app.json"],
                            ["tsconfig.eslint.json"],
                            ["type-tests", "tsconfig.json"]
                        ].map((path) => ["common-types", ...path]),
                        ...[
                            ["tsconfig.app.json"],
                            ["tsconfig.eslint.json"],
                            ["src", "tests", "tsconfig.json"],
                            ["type-tests", "tsconfig.json"]
                        ].map((path) => ["nameof", ...path]),
                        ...[
                            "tsconfig.app.json",
                            "tsconfig.editor.json",
                            "tsconfig.eslint.json"
                        ].map((path) => ["playground", path]),
                        ...[
                            ["tsconfig.app.json"],
                            ["tsconfig.eslint.json"],
                            ["src", "tests", "tsconfig.json"]
                        ].map((path) => ["test", ...path]),
                        ...[
                            ["tsconfig.app.json"],
                            ["tsconfig.eslint.json"],
                            ["type-tests", "tsconfig.json"]
                        ].map((path) => ["types", ...path]),
                        ...[
                            "tsconfig.app.json",
                            "tsconfig.editor.json"
                        ].map((path) => ["webpack-workspace", path])
                    ].map((path) => ["packages", ...path])
                ].map((path) => join(import.meta.dirname, ...path))
            }
        }
    }
];
