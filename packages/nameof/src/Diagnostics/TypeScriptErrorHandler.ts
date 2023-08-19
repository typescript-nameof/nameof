import { IErrorHandler } from "@typescript-nameof/common";
import { Diagnostic, Node } from "typescript";
import { ITypeScriptContext } from "../ITypeScriptContext";
import { TypeScriptFeatures } from "../TypeScriptFeatures";

/**
 * Provides the functionality to report errors to a TypeScript compiler.
 *
 * @template TFeatures
 * The type of the features for the error handler.
 */
export class TypeScriptErrorHandler<TFeatures extends TypeScriptFeatures = TypeScriptFeatures> implements IErrorHandler<Node, ITypeScriptContext>
{
    /**
     * A set of features for the error handler.
     */
    private features: TFeatures;

    /**
     * Initializes a new instance of the {@linkcode TypeScriptErrorHandler}.
     *
     * @param features
     * A set of features for the error handler.
     */
    public constructor(features: TFeatures)
    {
        this.features = features;
    }

    /**
     * Gets a set of features for the error handler.
     */
    protected get Features(): TFeatures
    {
        return this.features;
    }

    /**
     * Reports the specified {@linkcode error}.
     *
     * @param item
     * The item related to the specified {@linkcode error}.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to report.
     */
    public Report(item: Node, context: ITypeScriptContext, error: Error): void
    {
        this.ReportDiagnostic(error, this.GetDiagnostic(item, context, error));
    }

    /**
     * Creates a diagnostic for the specified {@linkcode error}.
     *
     * @param node
     * The node related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to create a diagnostic for.
     *
     * @returns
     * The diagnostic for the specified {@linkcode error}.
     */
    protected GetDiagnostic(node: Node, context: ITypeScriptContext, error: Error): Diagnostic
    {
        return {
            category: this.Features.TypeScript.DiagnosticCategory.Error,
            messageText: error.message,
            code: 1337,
            ...(
                context.file ?
                {
                    file: context.file,
                    start: node.getStart(context.file),
                    length: node.getWidth(context.file)
                } :
                {
                    file: undefined,
                    start: undefined,
                    length: undefined
                })
        };
    }

    /**
     * Reports the specified {@linkcode diagnostic}.
     *
     * @param error
     * The original error.
     *
     * @param diagnostic
     * The diagnostic to report.
     */
    protected ReportDiagnostic(error: Error, diagnostic: Diagnostic): void
    {
        throw error;
    }
}
