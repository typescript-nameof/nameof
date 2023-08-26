import { basename } from "path";
import { AdapterTests } from "./Adapter.test.js";
import { ErrorHandlerTests } from "./ErrorHandler.test.js";
import { ResultBuilderTests } from "./ResultBuilder.test.js";
import { TransformerBaseTests } from "./TransformerBase.test.js";

/**
 * Registers tests for purpose
 */
export function TransformationTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            AdapterTests();
            ResultBuilderTests();
            ErrorHandlerTests();
            TransformerBaseTests();
        });
}
