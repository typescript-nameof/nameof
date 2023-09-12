import { ErrorHandler, INodeLocation } from "@typescript-nameof/common";
import { Diagnostic, Node } from "typescript";
import { Constants } from "../Constants.cjs";
import { ITypeScriptContext } from "../Transformation/ITypeScriptContext.cjs";
import { TypeScriptFeatures } from "../Transformation/TypeScriptFeatures.cjs";

/**
 * Provides the functionality to report errors to a TypeScript compiler.
 *
 * @template TFeatures
 * The type of the features for the error handler.
 */
export class TypeScriptErrorHandler<TFeatures extends TypeScriptFeatures = TypeScriptFeatures, TContext extends ITypeScriptContext = ITypeScriptContext> extends ErrorHandler<Node, TContext>
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
        super();
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
     * @param location
     * The location of the specified {@linkcode node}.
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
    public override Report(location: INodeLocation, item: Node, context: TContext, error: Error): void
    {
        this.ReportDiagnostic(location, item, context, this.GetDiagnostic(item, context, error), error);
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
            source: Constants.SourceName,
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
     * @param location
     * The location of the specified {@linkcode node}.
     *
     * @param item
     * The node related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param diagnostic
     * The diagnostic to report.
     *
     * @param error
     * The original error.
     */
    protected ReportDiagnostic(location: INodeLocation, item: Node, context: TContext, diagnostic: Diagnostic, error: Error): void
    {
        super.Report(location, item, context, error);
    }
}
