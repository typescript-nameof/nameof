import { basename } from "path";
import { IdentifierNodeTests } from "./IdentifierNode.test.js";
import { IndexAccessNodeTests } from "./IndexAccessNode.test.js";

/**
 * Registers tests for serialization components.
 */
export function SerializationTests(): void
{
    suite(
        basename(new URL(".", import.meta.url).pathname),
        () =>
        {
            IdentifierNodeTests();
            IndexAccessNodeTests();
        });
}
