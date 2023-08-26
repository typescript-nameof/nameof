import { ok, strictEqual } from "assert";
import { replaceInText } from "../../text/replaceInText.cjs";

/**
 * Provides tests for the {@linkcode replaceInText} function.
 */
export function ReplaceInTextTests(): void
{
    suite(
        replaceInText.name,
        () =>
        {
            let expression: string;

            setup(
                () =>
                {
                    expression = "console";
                });

            test(
                "Checking whether the specified text is transformed properly…",
                () =>
                {
                    let result = replaceInText("/file.ts", `nameof(${expression})`);
                    ok(result.replaced);
                    strictEqual(result.fileText, `"${expression}"`);
                });

            test(
                "Checking whether the result indicates whether a transformation took place…",
                () =>
                {
                    let result = replaceInText("/file.ts", expression);
                    ok(!result.replaced);
                });

            test(
                "Checking whether specifying a file name is optional…",
                () =>
                {
                    let result = replaceInText(`nameof(${expression})`);
                    ok(result.replaced);
                    strictEqual(result.fileText, `"${expression}"`);
                });
        });
}
