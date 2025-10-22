import { Node } from "./Node.cjs";
import { ParsedNode } from "./ParsedNode.cjs";
import { PathPartCandidate } from "./PathPartCandidate.cjs";

/**
 * Represents a member access.
 */
export abstract class AccessExpressionNode<T> extends Node<T>
{
    /**
     * The expression of the member access operation.
     */
    private expression: ParsedNode<T>;

    /**
     * The property to access.
     */
    private property: ParsedNode<T>;

    /**
     * Initializes a new instance of the {@linkcode PropertyAccessNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression of the member access operation.
     *
     * @param property
     * The property to access.
     */
    public constructor(source: T, expression: ParsedNode<T>, property: ParsedNode<T>)
    {
        super(source);
        this.expression = expression;
        this.property = property;
    }

    /**
     * @inheritdoc
     */
    public get Expression(): ParsedNode<T>
    {
        return this.expression;
    }

    /**
     * Gets the index to access.
     */
    public get Property(): ParsedNode<T>
    {
        return this.property;
    }

    /**
     * @inheritdoc
     */
    public override get Path(): Array<PathPartCandidate<T>>
    {
        return [
            ...this.Expression.Path,
            this.PathPart
        ];
    }

    /**
     * @inheritdoc
     */
    public override get Root(): ParsedNode<T>
    {
        return this.Expression.Root;
    }
}
