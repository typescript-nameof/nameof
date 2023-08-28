import { IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput, TransformerTester } from "@typescript-nameof/test";
import { Node } from "typescript";
import { replaceInText } from "../../text/replaceInText.cjs";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";

/**
 * Provides the functionality to test the {@linkcode replaceInText} function.
 */
export class ReplaceInTextTester extends TransformerTester<Node, ITypeScriptContext>
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "replaceInText()";
    }

    /**
     * @inheritdoc
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
    protected override async Run(code: string, errorHandler?: IErrorHandler<Node, ITypeScriptContext> | undefined): Promise<string>
    {
        try
        {
            return replaceInText(code).fileText ?? "";
        }
        catch (error)
        {
            let newError: Error;

            if (error instanceof Error)
            {
                newError = error;
            }
            else
            {
                newError = new Error(`${error}`);
            }

            errorHandler?.Report({}, undefined as any, {} as any, newError);
            throw error;
        }
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input of the transformation.
     *
     * @param result
     * The output of the transformation.
     */
    protected override async HasError(input: string, result: INameofOutput): Promise<void>
    {
        await super.HasError(input, result);
    }
}
