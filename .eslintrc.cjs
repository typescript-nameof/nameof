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
            join(__dirname, "tsconfig.eslint.json"),
            projectPath("nameof"),
            join(projectRoot("nameof"), "src", "tests", "type-tests", "tsconfig.json"),
            join(projectRoot("common"), "tsconfig.app.json"),
            join(projectRoot("common"), "src", "tests", "tsconfig.json"),
            projectPath("common-types"),
            join(projectRoot("common-types"), "type-tests", "tsconfig.json"),
            projectPath("types"),
            join(projectRoot("types"), "tsconfig.eslint.json"),
            projectPath("babel-macro"),
            join(projectRoot("babel-macro"), "tsconfig.config.json"),
            projectPath("babel-plugin"),
            projectPath("tests-common"),
            projectPath("playground"),
            join(projectRoot("playground"), "tsconfig.editor.json"),
            join(projectRoot("playground"), "tsconfig.app.json")
        ]
    },
    ignorePatterns: [
        "packages/*/dist/**/*.*",
        "packages/*/lib/**/*.*",
        "packages/nameof/ts-nameof.d.ts",
        "packages/babel-macro/ts-nameof.macro.d.ts"
    ],
    rules: {
        "node/no-unpublished-import": [
            "error",
            {
                convertPath: pathConverter
            }
        ]
    },
    overrides: [
        {
            files: [
                "*.test-d.ts"
            ],
            rules: {
                "jsdoc/require-jsdoc": "off",
                "@delagen/deprecation/deprecation": "off",
                "@typescript-eslint/naming-convention": "off",
                "@typescript-eslint/no-namespace": "off"
            }
        }
    ]
};
