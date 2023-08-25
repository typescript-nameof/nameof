import { DiagnosticTests } from "./Diagnostics/index.test.js";
import { SerializationTests } from "./Serialization/index.test.js";

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
            SerializationTests();
        });
}

Tests();
