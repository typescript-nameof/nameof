import { basename } from "node:path";
import { AdapterErrorTests } from "./AdapterError.test.js";

/**
 * Registers tests for diagnostic components.
 */
export function DiagnosticTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            AdapterErrorTests();
        });
}
