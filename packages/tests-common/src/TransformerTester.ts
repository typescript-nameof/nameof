import { strictEqual } from "assert";
import { resolve } from "path";
import { INameofOutput } from "./INameofOutput";

/**
 * Provides the functionality to transform source code.
 */
export abstract class TransformerTester
{
    /**
     * Transforms the specified {@linkcode code}.
     *
     * @param code
     * The code to transform.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    public abstract Transform(code: string): Promise<INameofOutput>;

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
    protected async AssertTransformation(input: string, expected: string): Promise<void>
    {
        strictEqual(await this.Transform(input), expected);
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

        let result = await this.Transform(input);

        if (result.error)
        {
            if (!messages.includes(result.error.message))
            {
                throw new Error(
                    `Expected the error message ${JSON.stringify(result.error.message)} to equal one of the following messages:\n` +
                    `${JSON.stringify(messages, null, 4)}`);
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
     * Registers common tests.
     */
    protected RegisterCommon(): void
    {
    }
}
