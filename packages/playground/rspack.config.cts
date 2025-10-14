import { defineConfig } from "@rspack/cli";
import { ExternalItem, IgnorePlugin, SwcLoaderOptions } from "@rspack/core";
import { readJSONSync } from "fs-extra";
import merge from "lodash.merge";
import { join, resolve } from "path";
import webpackNodeExternals from "webpack-node-externals";

export default defineConfig({
    entry: {
        main: "./src/test/index.ts",
        jest: "./src/test/jest.test.ts",
        macro: "./src/test/macro.cts",
    },
    output: {
        path: join(process.cwd(), "out", "rspack")
    },
    externalsType: "commonjs",
    externals: [
        /\/babel\/macro/
    ],
    module: {
        rules: [
            {
                test: /\.[cm]?ts$/,
                loader: 'builtin:swc-loader',
                options: merge(
                    readJSONSync(join(process.cwd(), ".swcrc")),
                    {
                        jsc: {
                            minify: {
                                compress: false,
                                mangle: false,
                            },
                        },
                        minify: false,
                    } satisfies SwcLoaderOptions),
            },
        ],
    },
    optimization: {
        minimize: false,
    },
});
