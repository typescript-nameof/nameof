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
     * @param file
     * The file related to the error.
     *
     * @param node
     * The node related to the error.
     *
     * @param error
     * The error to process.
     */
    public ReportError(file: ts.SourceFile, node: ts.Node, error: Error): void
    {
        this.ReportDiagnostic(file, this.GetDiagnostic(file, node, error));
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
     * @param file
     * The file to get a diagnostic for.
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
    protected GetDiagnostic(file: ts.SourceFile, node: ts.Node, error: Error): ts.Diagnostic
    {
        return {
            file,
            category: this.TypeScript.DiagnosticCategory.Error,
            messageText: error.message,
            code: 1337,
            start: node.getStart(),
            length: node.getWidth()
        };
    }
}
