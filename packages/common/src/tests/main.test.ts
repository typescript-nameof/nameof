import { DiagnosticTests } from "./Diagnostics/index.test.js";
import { SerializationTests } from "./Serialization/index.test.js";
import { TransformationTests } from "./Transformation/index.test.js";

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
            TransformationTests();
        });
}

Tests();
