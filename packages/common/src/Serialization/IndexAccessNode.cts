import { AccessExpressionNode } from "./AccessExpressionNode.cjs";
import { NodeKind } from "./NodeKind.cjs";
import { ParsedNode } from "./ParsedNode.cjs";
import { PathKind } from "./PathKind.cjs";
import { PathPartCandidate } from "./PathPartCandidate.cjs";

/**
 * Represents an index access node.
 */
export class IndexAccessNode<T> extends AccessExpressionNode<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.IndexAccessNode;

    /**
     * Initializes a new instance of the {@linkcode IndexAccessNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression of the index access operation.
     *
     * @param property
     * The property to access.
     */
    public constructor(source: T, expression: ParsedNode<T>, property: ParsedNode<T>)
    {
        super(source, expression, property);
    }

    /**
     * @inheritdoc
     */
    public override get PathPart(): PathPartCandidate<T>
    {
        let source = this.Property.Source;

        switch (this.Property.Type)
        {
            case NodeKind.NumericLiteralNode:
            case NodeKind.StringLiteralNode:
                let value: string | number;

                if (this.Property.Type === NodeKind.NumericLiteralNode)
                {
                    value = this.Property.Value;
                }
                else
                {
                    value = this.Property.Text;
                }

                return {
                    type: PathKind.IndexAccess,
                    source,
                    value
                };
            case NodeKind.InterpolationNode:
                return this.Property.PathPart;
            default:
                return {
                    type: PathKind.Unsupported,
                    isAccessor: true,
                    source
                };
        }
    }
}
