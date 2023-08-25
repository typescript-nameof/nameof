import { strictEqual } from "assert";
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

            setup(
                () =>
                {
                    expression = new IdentifierNode({}, "window");
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
                            strictEqual(numericPart.source, number);
                            strictEqual(numericPart.value, number.Value);

                            strictEqual(stringPart.type, PathKind.IndexAccess);
                            strictEqual(stringPart.source, stringLiteral);
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
        });
}
