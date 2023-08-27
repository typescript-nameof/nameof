import { DiagnosticTests } from "./Diagnostics/index.test.js";
import { EndToEndTests } from "./e2e/index.test.js";
import { TextTests } from "./Text/index.test.js";
import { TransformationTests } from "./Transformation/index.test.js";
import { TypeScriptTester } from "./TypeScriptTester.js";

/**
 * Registers the tests.
 */
function Tests(): void
{
    suite(
        "nameof",
        () =>
        {
            DiagnosticTests();
            TransformationTests();
            TextTests();
            EndToEndTests();
        });
}

Tests();
