import { deepStrictEqual, strictEqual } from "assert";
import { nameOf } from "ts-nameof-proxy";
import { Node } from "../../Serialization/Node.cjs";
import { NodeKind } from "../../Serialization/NodeKind.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";

/**
 * Registers tests for the {@linkcode Node} class.
 */
export function NodeTests(): void
{
    suite(
        Node.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode Node} class for testing.
             */
            class TestNode extends Node<any>
            {
                /**
                 * @inheritdoc
                 */
                public override readonly Type = NodeKind.UnsupportedNode;
            }

            let node: Node<any>;

            setup(
                () =>
                {
                    node = new TestNode({});
                });

            suite(
                nameOf<Node<any>>((node) => node.PathPart),
                () =>
                {
                    test(
                        "Checking whether a path part indicating an unsupported node is returned by default…",
                        () =>
                        {
                            let part = node.PathPart;
                            strictEqual(part.type, PathKind.Unsupported);
                            strictEqual(part.source, node.Source);
                        });
                });

            suite(
                nameOf<Node<any>>((node) => node.Path),
                () =>
                {
                    test(
                        "Checking whether the node's own path part is returned by default…",
                        () =>
                        {
                            deepStrictEqual(node.Path, [node.PathPart]);
                        });
                });

            suite(
                nameOf<Node<any>>((node) => node.Root),
                () =>
                {
                    test(
                        "Checking whether the node returns itself by default…",
                        () =>
                        {
                            strictEqual(node.Root, node);
                        });
                });
        });
}
