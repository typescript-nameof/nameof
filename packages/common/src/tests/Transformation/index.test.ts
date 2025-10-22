import { basename } from "node:path";
import { AdapterTests } from "./Adapter.test.js";
import { ErrorHandlerTests } from "./ErrorHandler.test.js";
import { ResultBuilderTests } from "./ResultBuilder.test.js";
import { TransformerBaseTests } from "./TransformerBase.test.js";
import { TransformerFeaturesTests } from "./TransformerFeatures.test.js";

/**
 * Registers tests for purpose
 */
export function TransformationTests(): void
{
    suite(
        basename(import.meta.dirname),
        () =>
        {
            AdapterTests();
            ResultBuilderTests();
            ErrorHandlerTests();
            TransformerFeaturesTests();
            TransformerBaseTests();
        });
}
