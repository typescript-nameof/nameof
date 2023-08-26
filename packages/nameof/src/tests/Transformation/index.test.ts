import { basename } from "path";
import { TypeScriptAdapterTests } from "./TypeScriptAdapter.test.js";
import { TypeScriptFeatureTests } from "./TypeScriptFeatures.test.js";
import { TypeScriptTransformerBaseTests } from "./TypeScriptTransformerBase.test.js";

/**
 * Registers tests for transformation components.
 */
export function TransformationTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            TypeScriptFeatureTests();
            TypeScriptAdapterTests();
            TypeScriptTransformerBaseTests();
        });
}
