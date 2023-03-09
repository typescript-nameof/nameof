import * as path from "path";
import * as babel from "@babel/core";
import "@babel/preset-typescript";
// eslint-disable-next-line import/no-extraneous-dependencies
import { runCommonTests } from "@typescript-nameof/tests-common";
import { plugin } from "../index";

runCommonTests(run);

/**
 * Compiles the specified {@link text `text`}.
 *
 * @param text
 * The text to compile.
 *
 * @returns
 * The compiled code.
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
                plugin
            ],
            filename: path.resolve(__dirname, "test.ts"),
            ast: false,
            generatorOpts: {
                retainLines: true
            }
        })?.code ?? "";
}
