import { deepStrictEqual, strictEqual } from "node:assert";
import { nameOf } from "ts-nameof-proxy";
import { IdentifierNode } from "../../Serialization/IdentifierNode.cjs";
import { IndexAccessNode } from "../../Serialization/IndexAccessNode.cjs";
import { InterpolationNode } from "../../Serialization/InterpolationNode.cjs";
import { NumericLiteralNode } from "../../Serialization/NumericLiteralNode.cjs";
import { ParsedNode } from "../../Serialization/ParsedNode.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";
import { StringLiteralNode } from "../../Serialization/StringLiteralNode.cjs";

/**
 * Registers tests for the {@linkcode IndexAccessNode} class.
 */
export function IndexAccessNodeTests(): void
{
    suite(
        IndexAccessNode.name,
        () =>
        {
            let expression: ParsedNode<any>;
            let root: IdentifierNode<any>;
            let innerAccessor: IndexAccessNode<any>;
            let outerAccessor: IndexAccessNode<any>;

            setup(
                () =>
                {
                    expression = new IdentifierNode({}, "window");
                    root = new IdentifierNode({}, "console");
                    innerAccessor = new IndexAccessNode({}, root, new StringLiteralNode({}, "log"));
                    outerAccessor = new IndexAccessNode({}, innerAccessor, new StringLiteralNode({}, "bind"));
                });

            suite(
                nameOf<IndexAccessNode<any>>((node) => node.PathPart),
                () =>
                {
                    test(
                        "Checking whether string and numeric literal indexers are returned properly…",
                        () =>
                        {
                            let number = new NumericLiteralNode({}, 10);
                            let stringLiteral = new StringLiteralNode({}, "alert");
                            let numericPart = new IndexAccessNode({}, expression, number).PathPart;
                            let stringPart = new IndexAccessNode({}, expression, stringLiteral).PathPart;

                            strictEqual(numericPart.type, PathKind.IndexAccess);
                            strictEqual(numericPart.source, number.Source);
                            strictEqual(numericPart.value, number.Value);

                            strictEqual(stringPart.type, PathKind.IndexAccess);
                            strictEqual(stringPart.source, stringLiteral.Source);
                            strictEqual(stringPart.value, stringLiteral.Text);
                        });

                    test(
                        "Checking whether interpolation indexers are represented properly…",
                        () =>
                        {
                            let interpolation = new InterpolationNode({}, {});
                            let part = new IndexAccessNode({}, expression, interpolation).PathPart;

                            strictEqual(part.type, PathKind.Interpolation);
                            strictEqual(part.source, interpolation.Source);
                            strictEqual(part.node, interpolation.Expression);
                        });

                    test(
                        "Checking whether other nodes cause an unsupported path part…",
                        () =>
                        {
                            let part = new IndexAccessNode({}, expression, expression).PathPart;
                            strictEqual(part.type, PathKind.Unsupported);
                            strictEqual(part.isAccessor, true);
                            strictEqual(part.source, expression.Source);
                        });
                });

            suite(
                nameOf<IndexAccessNode<any>>((node) => node.Path),
                () =>
                {
                    test(
                        "Checking whether the full path including the path of the underlying expression is returned…",
                        () =>
                        {
                            deepStrictEqual(innerAccessor.Path, [root.PathPart, innerAccessor.PathPart]);
                            deepStrictEqual(outerAccessor.Path, [root.PathPart, innerAccessor.PathPart, outerAccessor.PathPart]);
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
                            strictEqual(innerAccessor.Root, root);
                            strictEqual(outerAccessor.Root, root);
                        });
                });
        });
}
