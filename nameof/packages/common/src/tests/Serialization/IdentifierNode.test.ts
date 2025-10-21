import { strictEqual } from "node:assert";
import { nameOf } from "ts-nameof-proxy";
import { IdentifierNode } from "../../Serialization/IdentifierNode.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";

/**
 * Registers tests for the {@linkcode IdentifierNode} class.
 */
export function IdentifierNodeTests(): void
{
    suite(
        IdentifierNode.name,
        () =>
        {
            let node: IdentifierNode<any>;

            setup(
                () =>
                {
                    node = new IdentifierNode({}, "console");
                });

            suite(
                nameOf<IdentifierNode<any>>((node) => node.PathPart),
                () =>
                {
                    test(
                        "Checking whether the path part indicates the identifier properly…",
                        () =>
                        {
                            let pathPart = node.PathPart;
                            strictEqual(pathPart.type, PathKind.Identifier);
                            strictEqual(pathPart.source, node.Source);
                            strictEqual(pathPart.value, node.Name);
                        });
                });
        });
}
