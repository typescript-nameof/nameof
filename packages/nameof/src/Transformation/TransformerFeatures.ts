import type ts = require("typescript");

/**
 * Provides features for transforming TypeScript code.
 */
export class TransformerFeatures
{
    /**
     * Gets an instance of a TypeScript compiler.
     */
    protected get TypeScript(): typeof ts
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
        let file = node.getSourceFile();
        this.ReportDiagnostic(file, this.GetDiagnostic(node, error));
    }

    /**
     * Reports the specified {@linkcode diagnostic}.
     *
     * @param file
     * The file related to the diagnostic.
     *
     * @param diagnostic
     * The diagnostic to report.
     */
    protected ReportDiagnostic(file: ts.SourceFile, diagnostic: ts.Diagnostic): void
    { }

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
    protected GetDiagnostic(node: ts.Node, error: Error): ts.Diagnostic
    {
        return {
            file: node.getSourceFile(),
            category: this.TypeScript.DiagnosticCategory.Error,
            messageText: error.message,
            code: 1337,
            start: node.getStart(),
            length: node.getWidth()
        };
    }
}
