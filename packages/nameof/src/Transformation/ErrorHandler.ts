import type ts = require("typescript");

/**
 * Provides the functionality to handle errors.
 */
export abstract class ErrorHandler
{
    /**
     * Gets a TypeScript instance.
     */
    protected abstract get TypeScript(): typeof ts;

    /**
     * Processes the specified {@linkcode error}.
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
    public abstract Process(file: ts.SourceFile, node: ts.Node, error: Error): void;

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
