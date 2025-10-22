import { basename } from "node:path";
import { AccessExpressionNodeTests } from "./AccessExpressionNode.test.js";
import { IdentifierNodeTests } from "./IdentifierNode.test.js";
import { IndexAccessNodeTests } from "./IndexAccessNode.test.js";
import { InterpolationNodeTests } from "./InterpolationNode.test.js";
import { NodeTests } from "./Node.test.js";
import { PropertyAccessNodeTests } from "./PropertyAccessNode.test.js";
import { UnsupportedNodeTests } from "./UnsupportedNode.test.js";

/**
 * Registers tests for serialization components.
 */
export function SerializationTests(): void
{
    suite(
        basename(import.meta.dirname),
        () =>
        {
            NodeTests();
            IdentifierNodeTests();
            AccessExpressionNodeTests();
            PropertyAccessNodeTests();
            IndexAccessNodeTests();
            InterpolationNodeTests();
            UnsupportedNodeTests();
        });
}
