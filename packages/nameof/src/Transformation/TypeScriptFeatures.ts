import { TransformerFeatures } from "@typescript-nameof/common";
import { IErrorHandler } from "@typescript-nameof/common/src/Transformation/IErrorHandler";
import type ts = require("typescript");
import { TypeScriptErrorHandler } from "./Diagnostics/TypeScriptErrorHandler";
import { ITypeScriptContext } from "./ITypeScriptContext";

/**
 * Provides features for transforming TypeScript code.
 */
export class TypeScriptFeatures extends TransformerFeatures<ts.Node, ITypeScriptContext>
{
    /**
     * Initializes a new instance of the {@linkcode TransformerFeatures TypeScriptFeatures<T>} class.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(errorHandler?: IErrorHandler<ts.Node, ITypeScriptContext>)
    {
        super(errorHandler);
    }

    /**
     * Gets an instance of a TypeScript compiler.
     */
    public get TypeScript(): typeof ts
    {
        return require("typescript");
    }

    /**
     * Reports the specified {@linkcode error}.
     *
     * @param node
     * The node related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to process.
     */
    public ReportError(node: ts.Node, context: ITypeScriptContext, error: Error): void
    {
        this.ErrorHandler?.Report(node, context, error);
    }

    /**
     * Initializes a new error handler.
     *
     * @returns
     * The newly created error handler.
     */
    protected InitializeErrorHandler(): IErrorHandler<ts.Node, ITypeScriptContext>
    {
        return new TypeScriptErrorHandler(this);
    }
}
