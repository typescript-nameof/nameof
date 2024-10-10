import { basename } from "node:path";
import { TypeScriptErrorHandlerTests } from "./TypeScriptErrorHandler.test.js";

/**
 * Registers tests for diagnostic components.
 */
export function DiagnosticTests(): void
{
    suite(
        basename(import.meta.dirname),
        () =>
        {
            TypeScriptErrorHandlerTests();
        });
}
