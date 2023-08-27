import { basename } from "path";
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
            BabelTransformerTests();
        });
}
