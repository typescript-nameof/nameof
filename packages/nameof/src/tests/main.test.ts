import { DiagnosticTests } from "./Diagnostics/index.test.js";
import { EndToEndTests } from "./e2e/index.test.js";
import { TypeScriptTester } from "./TypeScriptTester.js";

/**
 * Registers the tests.
 */
function Tests(): void
{
    let tester = new TypeScriptTester();

    suite(
        "nameof",
        () =>
        {
            DiagnosticTests();
            EndToEndTests();
            tester.RegisterCommon();
        });
}

Tests();
