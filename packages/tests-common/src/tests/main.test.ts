import { TesterBaseTests } from "./TesterBase.test.js";

/**
 * Registers the tests.
 */
function Tests(): void
{
    suite(
        "tests-common",
        () =>
        {
            TesterBaseTests();
        });
}

Tests();
