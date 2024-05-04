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
        "@typescript-nameof/babel"
    ]
} as TransformOptions;
