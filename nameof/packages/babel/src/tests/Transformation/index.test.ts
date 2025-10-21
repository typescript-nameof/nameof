import { basename } from "node:path";
import { BabelAdapterTests } from "./BabelAdapter.test.js";
import { BabelTransformerTests } from "./BabelTransformer.test.js";

/**
 * Registers tests for transformation components.
 */
export function TransformationTests(): void
{
    suite(
        basename(import.meta.dirname),
        () =>
        {
            BabelAdapterTests();
            BabelTransformerTests();
        });
}
