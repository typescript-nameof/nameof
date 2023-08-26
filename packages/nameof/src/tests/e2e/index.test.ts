import { TextTests } from "./text/index.test.js";

/**
 * Registers end-to-end tests.
 */
export function EndToEndTests(): void
{
    suite(
        "End-to-End",
        () =>
        {
            TextTests();
        });
}
