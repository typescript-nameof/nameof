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
     * The index to access.
     */
    private index: ParsedNode<T>;

    /**
     * Initializes a new instance of the {@linkcode IndexAccessNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression of the index access operation.
     *
     * @param index
     * The index to access.
     */
    public constructor(source: T, expression: ParsedNode<T>, index: ParsedNode<T>)
    {
        super(source, expression);
        this.index = index;
    }

    /**
     * Gets the index to access.
     */
    public get Index(): ParsedNode<T>
    {
        return this.index;
    }

    /**
     * @inheritdoc
     */
    public override get PathPart(): PathPartCandidate<T>
    {
        let source = this.Index.Source;

        switch (this.Index.Type)
        {
            case NodeKind.NumericLiteralNode:
            case NodeKind.StringLiteralNode:
                let value: string | number;

                if (this.Index.Type === NodeKind.NumericLiteralNode)
                {
                    value = this.Index.Value;
                }
                else
                {
                    value = this.Index.Text;
                }

                return {
                    type: PathKind.IndexAccess,
                    source,
                    value
                };
            case NodeKind.InterpolationNode:
                return this.index.PathPart;
            default:
                return {
                    type: PathKind.Unsupported,
                    isAccessor: true,
                    source
                };
        }
    }
}
