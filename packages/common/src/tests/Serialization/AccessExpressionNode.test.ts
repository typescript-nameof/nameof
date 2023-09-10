import { deepStrictEqual, strictEqual } from "assert";
import { nameOf } from "ts-nameof-proxy";
import { AccessExpressionNode } from "../../Serialization/AccessExpressionNode.cjs";
import { IdentifierNode } from "../../Serialization/IdentifierNode.cjs";
import { IndexAccessNode } from "../../Serialization/IndexAccessNode.cjs";
import { NodeKind } from "../../Serialization/NodeKind.cjs";
import { PropertyAccessNode } from "../../Serialization/PropertyAccessNode.cjs";
import { StringLiteralNode } from "../../Serialization/StringLiteralNode.cjs";

/**
 * Registers tests for the {@linkcode AccessExpressionNode} class.
 */
export function AccessExpressionNodeTests(): void
{
    suite(
        AccessExpressionNode.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode AccessExpressionNode} class for testing.
             */
            class TestAccessExpressionNode extends AccessExpressionNode<any>
            {
                /**
                 * @inheritdoc
                 */
                public override Type: NodeKind = NodeKind.UnsupportedNode;
            }

            let root: IdentifierNode<any>;
            let accessor: TestAccessExpressionNode;
            let nestedAccessor: TestAccessExpressionNode;

            setup(
                () =>
                {
                    root = new IdentifierNode({}, "console");
                    accessor = new TestAccessExpressionNode({}, root, new StringLiteralNode({}, "log"));
                    nestedAccessor = new TestAccessExpressionNode({}, accessor as PropertyAccessNode<any>, new StringLiteralNode({}, "bind"));
                });

            suite(
                nameOf<IndexAccessNode<any>>((node) => node.Path),
                () =>
                {
                    test(
                        "Checking whether the full path including the path of the underlying expression is returned…",
                        () =>
                        {
                            deepStrictEqual(accessor.Path, [root.PathPart, accessor.PathPart]);
                            deepStrictEqual(nestedAccessor.Path, [root.PathPart, accessor.PathPart, nestedAccessor.PathPart]);
                        });
                });

            suite(
                nameOf<IndexAccessNode<any>>((node) => node.Root),
                () =>
                {
                    test(
                        "Checking whether the root of the access path is returned…",
                        () =>
                        {
                            strictEqual(accessor.Root, root);
                            strictEqual(nestedAccessor.Root, root);
                        });
                });
        });
}
