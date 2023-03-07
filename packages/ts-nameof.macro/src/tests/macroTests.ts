/// <reference path="../references.d.ts" />
import * as assert from "assert";
import * as path from "path";
import * as babel from "@babel/core";
import "@babel/preset-typescript";
// eslint-disable-next-line import/no-extraneous-dependencies
import { runCommonTests } from "@ts-nameof/tests-common";
import babelPluginMacros from "babel-plugin-macros";

runCommonTests(run, { commonPrefix: "import nameof from './ts-nameof.macro';\n" });

describe(
    "using a name other than nameof",
    () =>
    {
        it(
            "should work when using a different import name",
            () =>
            {
                const text = "import other from './ts-nameof.macro';other(console.log);other.full(console.log);";
                assert.equal(run(text), '"log";"console.log";');
            });
    });

/**
 * Transforms the specified {@link text `text`}.
 *
 * @param text
 * The text to transform.
 *
 * @returns
 * The transformed text.
 */
function run(text: string): string
{
    return babel.transformSync(
        text,
        {
            presets: [
                "@babel/preset-typescript"
            ],
            plugins: [
                babelPluginMacros
            ],
            filename: path.join(__dirname, "test.ts"),
            ast: false,
            generatorOpts: {
                retainLines: true
            }
        })?.code ?? "";
}
