import { TransformOptions } from "@babel/core";

module.exports = {
    presets: [
        "@babel/preset-typescript",
        [
            "@babel/preset-env",
            {
                targets: {
                    node: 20
                }
            }
        ]
    ],
    plugins: [
        // eslint-disable-next-line node/no-unpublished-require
        require.resolve("../babel-plugin")
    ]
} as TransformOptions;
