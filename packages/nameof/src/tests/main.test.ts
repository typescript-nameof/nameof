import { DiagnosticTests } from "./Diagnostics/index.test.js";
import { TextTests } from "./text/index.test.js";
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
            TextTests();
            tester.RegisterCommon();
        });
}

Tests();
