import { basename } from "path";
import { TypeScriptAdapterTests } from "./TypeScriptAdapter.test.js";

/**
 * Registers tests for transformation components.
 */
export function TransformationTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            TypeScriptAdapterTests();
        });
}
