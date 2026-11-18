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
        "macros"
    ]
} as import("@babel/core", { with: { "resolution-mode": "import" } }).InputOptions;
