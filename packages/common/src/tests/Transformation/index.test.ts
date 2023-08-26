import { basename } from "path";
import { AdapterTests } from "./Adapter.test.js";
import { ErrorHandlerTests } from "./ErrorHandler.test.js";

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
            ErrorHandlerTests();
        });
}
