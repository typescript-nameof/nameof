import { INodeLocation } from "@typescript-nameof/common";
import { Diagnostic, Node } from "typescript";
import { TypeScriptErrorHandler } from "./TypeScriptErrorHandler.cjs";
import { ILanguageServiceContext } from "../LanguageService/ILanguageServiceContext.cjs";
import { LanguageServiceFeatures } from "../LanguageService/LanguageServiceFeatures.cjs";

/**
 * Provides the functionality to handle errors for a language service.
 */
export class LanguageServiceErrorHandler extends TypeScriptErrorHandler<LanguageServiceFeatures, ILanguageServiceContext>
{
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
    protected override ReportDiagnostic(location: INodeLocation, item: Node, context: ILanguageServiceContext, diagnostic: Diagnostic, error: Error): void
    {
        context.diagnostics ??= [];
        context.diagnostics.push(diagnostic);
    }
}
