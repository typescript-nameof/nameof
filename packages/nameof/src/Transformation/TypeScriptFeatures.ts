import { TransformerFeatures } from "@typescript-nameof/common";
import { IErrorHandler } from "@typescript-nameof/common/src/Transformation/IErrorHandler";
import type ts = require("typescript");
import { TypeScriptErrorHandler } from "./Diagnostics/TypeScriptErrorHandler";

/**
 * Provides features for transforming TypeScript code.
 */
export class TypeScriptFeatures extends TransformerFeatures<ts.Node>
{
    /**
     * Initializes a new instance of the {@linkcode TransformerFeatures TypeScriptFeatures<T>} class.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(errorHandler?: IErrorHandler<ts.Node>)
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
     * @param error
     * The error to process.
     */
    public ReportError(node: ts.Node, error: Error): void
    {
        this.ErrorHandler?.Report(node, error);
    }

    /**
     * Initializes a new error handler.
     *
     * @returns
     * The newly created error handler.
     */
    protected InitializeErrorHandler(): IErrorHandler<ts.Node>
    {
        return new TypeScriptErrorHandler(this);
    }
}
