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
        "module:@typescript-nameof/babel"
    ]
} as TransformOptions;
