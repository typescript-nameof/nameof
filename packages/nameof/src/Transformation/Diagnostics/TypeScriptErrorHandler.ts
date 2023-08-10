import { IErrorHandler } from "@typescript-nameof/common";
import { Diagnostic, Node } from "typescript";
import { TypeScriptFeatures } from "../TypeScriptFeatures";

/**
 * Provides the functionality to report errors to a TypeScript compiler.
 *
 * @template TFeatures
 * The type of the features for the error handler.
 */
export class TypeScriptErrorHandler<TFeatures extends TypeScriptFeatures = TypeScriptFeatures> implements IErrorHandler<Node>
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
     * @param error
     * The error to report.
     */
    public Report(item: Node, error: Error): void
    {
        this.ReportDiagnostic(this.GetDiagnostic(item, error));
    }

    /**
     * Creates a diagnostic for the specified {@linkcode error}.
     *
     * @param node
     * The node related to the error.
     *
     * @param error
     * The error to create a diagnostic for.
     *
     * @returns
     * The diagnostic for the specified {@linkcode error}.
     */
    protected GetDiagnostic(node: Node, error: Error): Diagnostic
    {
        return {
            file: node.getSourceFile(),
            category: this.Features.TypeScript.DiagnosticCategory.Error,
            messageText: error.message,
            code: 1337,
            start: node.getStart(),
            length: node.getWidth()
        };
    }

    /**
     * Reports the specified {@linkcode diagnostic}.
     *
     * @param diagnostic
     * The diagnostic to report.
     */
    protected ReportDiagnostic(diagnostic: Diagnostic): void
    { }
}
