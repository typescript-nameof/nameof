import { rejects, strictEqual } from "assert";

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
    public abstract Transform(code: string): Promise<string>;

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
     * @param message
     * The expected error message.
     */
    protected async AssertError(input: string, message: string): Promise<void>
    {
        rejects(
            () => this.Transform(input),
            message);
    }

    /**
     * Registers common tests.
     */
    protected RegisterCommon(): void
    {
    }
}
