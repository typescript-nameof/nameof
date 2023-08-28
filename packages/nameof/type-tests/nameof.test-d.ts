/* istanbul ignore next */
import tsNameOf = require("@typescript-nameof/nameof");
import * as tsNameOfEs6 from "@typescript-nameof/nameof";
import { expectType } from "tsd";

/* istanbul ignore next */
/**
 * Provides some type tests.
 */
export function testFunc(): void
{
    tsNameOf.replaceInFiles(["test"]);
    tsNameOf.replaceInFiles(["test"]).then(() => { });

    // replaceInText
    const replaceInTextResult = tsNameOf.replaceInText("fileName.ts", "const t = 5;");
    console.log(replaceInTextResult);
    expectType<string | undefined>(replaceInTextResult.fileText);
    expectType<boolean>(replaceInTextResult.replaced);

    // es6 test
    const es6Result = tsNameOfEs6.replaceInText("file.ts", "");
    console.log(es6Result.replaced);
    expectType<string | undefined>(es6Result.fileText);
    expectType<boolean>(es6Result.replaced);
}
