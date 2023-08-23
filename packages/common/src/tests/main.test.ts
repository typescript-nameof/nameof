import { DiagnosticTests } from "./Diagnostics/index.test.js";

/**
 * Registers the tests.
 */
function Tests(): void
{
    suite(
        "common",
        () =>
        {
            DiagnosticTests();
        });
}

Tests();
