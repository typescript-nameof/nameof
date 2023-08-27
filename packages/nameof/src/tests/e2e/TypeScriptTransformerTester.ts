import { IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput, TransformerTester } from "@typescript-nameof/tests-common";
import ts = require("typescript");
import { CompilerResult } from "./CompilerResult.js";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";

/**
 * Provides the functionality to test typescript transformers.
 */
export abstract class TypeScriptTransformerTester extends TransformerTester<ts.Node, ITypeScriptContext>
{
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
    protected async Run(code: string, errorHandler?: IErrorHandler<ts.Node, ITypeScriptContext>): Promise<string>
    {
        let result = await this.RunTransformer(code, errorHandler);

        if (result.diagnostics)
        {
            for (let diagnostic of result.diagnostics)
            {
                if (diagnostic.source === "typescript-nameof")
                {
                    errorHandler?.Report(
                        {},
                        undefined as any,
                        undefined as any,
                        new Error(`${diagnostic.messageText}`));
                }
            }
        }

        return result.code;
    }

    /**
     * Runs the transformer.
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    protected abstract RunTransformer(code: string, errorHandler?: IErrorHandler<ts.Node, ITypeScriptContext> | undefined): Promise<CompilerResult>;

    /**
     * @inheritdoc
     *
     * @param result
     * The result to check for errors.
     *
     * @param errorClasses
     * The expected types of errors.
     *
     * @returns
     * The error of one of the specified types.
     */
    protected override FindError(result: INameofOutput, ...errorClasses: Array<(new (...args: any[]) => Error)>): Error | undefined
    {
        let error = super.FindError(result, ...errorClasses);
        let typeNames = errorClasses.map((errorClass) => errorClass.name);

        if (error)
        {
            if (!result.errors.some(
                (err) =>
                {
                    return !typeNames.includes(err.name) &&
                        err.message === error?.message;
                }))
            {
                throw new Error(`A diagnostic with the message \`${error.message}\` has not been reported!`);
            }
            else
            {
                return error;
            }
        }
        else
        {
            return error;
        }
    }
}
