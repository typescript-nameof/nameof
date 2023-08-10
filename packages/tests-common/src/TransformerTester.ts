import { strictEqual } from "assert";
import { resolve } from "path";
import { ErrorHandler, IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput } from "./INameofOutput";
import { TestErrorHandler } from "./TestErrorHandler";

/**
 * Provides the functionality to transform source code.
 *
 * @template T
 * The type of the node which are being transformed.
 */
export abstract class TransformerTester<T>
{
    /**
     * Registers common tests.
     */
    public RegisterCommon(): void
    {
    }

    /**
     * Transforms the specified {@linkcode code}.
     *
     * @param code
     * The code to transform.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected async Transform(code: string): Promise<INameofOutput>
    {
        let output: string | undefined;
        let errorHandler = new TestErrorHandler(this.DefaultErrorHandler);

        try
        {
            output = await this.Run(code, errorHandler);
        }
        catch
        { }

        return {
            errors: [...errorHandler.Errors],
            output
        };
    }

    /**
     * Runs the transformation of the specified {@linkcode code}.
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected abstract Run(code: string, errorHandler?: IErrorHandler<T>): Promise<string>;

    /**
     * Pre-processes the specified {@linkcode code}.
     *
     * @param code
     * The code to pre-process.
     *
     * @returns
     * Pre-processes the specified {@linkcode code}.
     */
    protected async Preprocess(code: string): Promise<string>
    {
        return code;
    }

    /**
     * Asserts the output of a transformation.
     *
     * @param input
     * The input of the transformation.
     *
     * @param expected
     * The expected output of the transformation.
     */
    protected async Assert(input: string, expected: string): Promise<void>
    {
        strictEqual((await this.Transform(input)).output, expected);
    }

    /**
     * Asserts the occurrence of an error with the specified {@linkcode message}.
     *
     * @param input
     * The input of the transformation.
     *
     * @param potentialMessages
     * A set of messages of which at least one is expected to occur.
     */
    protected async AssertError(input: string, ...potentialMessages: string[]): Promise<void>
    {
        let result = await this.Transform(input);
        let babelPath = resolve(__dirname, "..", "..", "babel-transformer", "src", "tests", "test.ts");

        let messages = potentialMessages.flatMap(
            (message) =>
            {
                return [
                    `[ts-nameof]: ${message}`,
                    `[ts-nameof:/file.ts]: ${message}`,
                    `${babelPath}: [ts-nameof:${babelPath}]: ${message}`,
                    `${resolve(__dirname, "..", "..", "babel-macro", "src", "tests", "test.ts")}: ./ts-nameof.macro: [ts-nameof]: ${message}`
                ];
            });

        if (result.errors.length > 0)
        {
            if (!result.errors.some((error) => messages.includes(error.message)))
            {
                throw new Error(
                    "Expected one of the following messages:\n" +
                    `${JSON.stringify(messages, null, 4)}\n` +
                    "but got\n" +
                    `${JSON.stringify(result.errors.map((error) => error.message), null, 4)}`);
            }
        }
        else
        {
            throw new Error(
                `Expected the code ${JSON.stringify(input)} to cause an error, but returned the following result:\n` +
                `${JSON.stringify(result.output)}`);
        }
    }

    /**
     * Gets the default error handler of the transformer under test.
     */
    protected get DefaultErrorHandler(): IErrorHandler<T>
    {
        return new ErrorHandler();
    }
}
