import { resolve } from "node:path";
import { Configuration } from "webpack";

module.exports = {
    mode: "development",
    entry: "../playground/src/test/index.ts",
    devtool: "inline-source-map",
    experiments: {
        outputModule: true
    },
    output: {
        path: resolve(__dirname, "..", "playground", "out", "webpack"),
        libraryTarget: "module"
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js"],
        // Add support for TypeScripts fully qualified ESM imports.
        extensionAlias: {
            ".js": [".js", ".ts"],
            ".cjs": [".cjs", ".cts"],
            ".mjs": [".mjs", ".mts"]
        }
    },
    module: {
        rules: [
            {
                test: /\.([cm]?ts|tsx)$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true,
                    configFile: "tsconfig.app.json",
                    getCustomTransformers: () =>
                    {
                        return {
                            before: [
                                require("../nameof")
                            ]
                        };
                    }
                }
            }
        ]
    }
} as Configuration;
