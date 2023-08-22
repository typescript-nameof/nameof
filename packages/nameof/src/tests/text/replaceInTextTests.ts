import * as assert from "assert";
import { IErrorHandler } from "@typescript-nameof/common";
import { TransformerTester } from "@typescript-nameof/tests-common";
import { replaceInText } from "../../text/index.cjs";

/**
 * Registers tests for the {@linkcode replaceInText} function.
 */
export function ReplaceInTextTests(): void
{
    suite(
        "replaceInText",
        () =>
        {
            suite(
                "Specific",
                () =>
                {
                    test(
                        "should unofficially maintain backwards compatibility when providing one argument",
                        () =>
                        {
                            assert.equal((replaceInText as any)("nameof(window);").fileText, '"window";');
                        });

                    test(
                        "should not replace when no nameof",
                        () =>
                        {
                            const result = replaceInText("file.ts", "some random text with no nameof in it");
                            assert.equal(result.replaced, false);
                            assert.equal(result.fileText, undefined);
                        });

                    test(
                        "should replace when there was a nameof",
                        () =>
                        {
                            const result = replaceInText("file.ts", "suite(nameof(myTest), () => {});");
                            assert.equal(result.replaced, true);
                            assert.equal(result.fileText, 'suite("myTest", () => {});');
                        });

                    test(
                        "should replace when there was a nameof in tsx file",
                        () =>
                        {
                            const result = replaceInText("file.tsx", "const t = <div t={nameof(t)} />;");
                            assert.equal(result.replaced, true);
                            assert.equal(result.fileText, 'const t = <div t={"t"} />;');
                        });
                });

            suite(
                "Common",
                () =>
                {
                    new class extends TransformerTester<undefined>
                    {
                        /**
                         * @inheritdoc
                         *
                         * @param code
                         * The code to test.
                         *
                         * @param errorHandler
                         * A component for reporting errors.
                         *
                         * @returns
                         * The transformed test.
                         */
                        protected async Run(code: string, errorHandler?: IErrorHandler<undefined> | undefined): Promise<string>
                        {
                            let result: string | undefined;

                            try
                            {
                                result = replaceInText("file.ts", code).fileText ?? code;
                            }
                            catch (error)
                            {
                                if (error instanceof Error)
                                {
                                    errorHandler?.Report({}, undefined, {}, error);
                                }
                            }

                            return result ?? "";
                        }

                        /**
                         * @inheritdoc
                         *
                         * @param input
                         * The input of the transformation.
                         *
                         * @param errorClasses
                         * The classes of the expected error.
                         */
                        protected override AssertError(input: string, ...errorClasses: Array<new (...args: any[]) => Error>): Promise<void>
                        {
                            return super.AssertError(input);
                        }
                    }().RegisterCommon();
                });
        });
}
