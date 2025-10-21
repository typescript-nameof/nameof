import { basename } from "node:path";
import { TypeScriptAdapterTests } from "./TypeScriptAdapter.test.js";
import { TypeScriptFeatureTests } from "./TypeScriptFeatures.test.js";
import { TypeScriptTransformerBaseTests } from "./TypeScriptTransformerBase.test.js";

/**
 * Registers tests for transformation components.
 */
export function TransformationTests(): void
{
    suite(
        basename(import.meta.dirname),
        () =>
        {
            TypeScriptFeatureTests();
            TypeScriptAdapterTests();
            TypeScriptTransformerBaseTests();
        });
}
