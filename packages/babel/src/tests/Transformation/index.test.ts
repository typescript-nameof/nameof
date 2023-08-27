import { basename } from "path";
import { BabelAdapterTests } from "./BabelAdapter.test.js";
import { BabelTransformerTests } from "./BabelTransformer.test.js";

/**
 * Registers tests for transformation components.
 */
export function TransformationTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            BabelAdapterTests();
            BabelTransformerTests();
        });
}
