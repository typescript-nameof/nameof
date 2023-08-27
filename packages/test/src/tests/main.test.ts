import { TesterBaseTests } from "./TesterBase.test.js";

/**
 * Registers the tests.
 */
function Tests(): void
{
    suite(
        "test",
        () =>
        {
            TesterBaseTests();
        });
}

Tests();
