const { join } = require("node:path");
const { PluginName, PresetName } = require("@manuth/eslint-plugin-typescript");

let pathConverter = [
    {
        include: [
            "src/**/*.ts"
        ],
        replace: [
            "^src/(.+)\\.ts$",
            "dist/$1.js"
        ]
    },
    {
        include: [
            "src/**/*.[cm]ts"
        ],
        replace: [
            "^src/(.+)\\.([cm])ts$",
            "dist/$1.$2js"
        ]
    },
    {
        include: [
            "src/**"
        ],
        replace: [
            "^src/(.+)$",
            "dist/$1"
        ]
    }
];

/**
 * Creates the path to the root of the project with the specified {@link projectName `projectName`}.
 *
 * @param {string} projectName
 * The name of the project to get the path to the root for.
 *
 * @returns {string}
 * The path to the root of the project with the specified {@link projectName `projectName`}
 */
function projectRoot(projectName)
{
    return join(__dirname, "packages", projectName);
}

/**
 * Creates the path to the project with the specified {@link projectName `projectName`}.
 *
 * @param {string} projectName
 * The name of the project to get the path for.
 *
 * @returns {string}
 * The path to the project with the specified {@link projectName `projectName`}
 */
function projectPath(projectName)
{
    return join(projectRoot(projectName), "tsconfig.json");
}

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
            join(__dirname, "tsconfig.json"),
            join(__dirname, "tsconfig.eslint.json"),
            projectPath("ts-nameof"),
            join(projectRoot("ts-nameof"), "tsconfig.config.json"),
            join(projectRoot("ts-nameof"), "lib", "tsconfig.json"),
            projectPath("types"),
            join(projectRoot("types"), "tsconfig.eslint.json"),
            projectPath("ts-nameof.macro"),
            join(projectRoot("ts-nameof.macro"), "tsconfig.config.json"),
            projectPath("babel-plugin-ts-nameof"),
            projectPath("transforms-common"),
            projectPath("transforms-ts"),
            projectPath("transforms-babel"),
            projectPath("common"),
            projectPath("scripts-common"),
            projectPath("tests-common"),
            projectPath("test"),
            join(projectRoot("test"), "src", "macro", "tsconfig.json")
        ]
    },
    ignorePatterns: [
        "packages/*/dist/**/*.*",
        "packages/ts-nameof/ts-nameof.d.ts",
        "packages/ts-nameof.macro/ts-nameof.macro.d.ts"
    ],
    rules: {
        "node/no-unpublished-import": [
            "error",
            {
                convertPath: pathConverter
            }
        ]
    }
};
