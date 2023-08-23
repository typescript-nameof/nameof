import { strictEqual } from "node:assert";

/**
 * Registers the tests.
 */
function Tests(): void
{
    suite(
        "tests-common",
        () =>
        {
            test(
                "Example…",
                () =>
                {
                    strictEqual(1, 1);
                });
        });
}

Tests();
