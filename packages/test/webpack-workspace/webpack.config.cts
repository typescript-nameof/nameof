import { resolve } from "path";
import { Configuration } from "webpack";

module.exports = {
    mode: "development",
    entry: "../src/test/index.ts",
    devtool: "inline-source-map",
    experiments: {
        outputModule: true
    },
    output: {
        path: resolve(__dirname, "..", "out", "webpack"),
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
                    getCustomTransformers: () =>
                    {
                        return {
                            before: [
                                // eslint-disable-next-line node/no-unpublished-require
                                require("../../nameof")
                            ]
                        };
                    }
                }
            }
        ]
    }
} as Configuration;
