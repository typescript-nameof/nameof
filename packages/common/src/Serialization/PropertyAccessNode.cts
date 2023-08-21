import { Node } from "./Node.cjs";
import { NodeKind } from "./NodeKind.cjs";
import { ParsedNode } from "./ParsedNode.cjs";
import { PathKind } from "./PathKind.cjs";
import { PathPartCandidate } from "./PathPartCandidate.cjs";

/**
 * Represents a property access.
 */
export class PropertyAccessNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.PropertyAccessNode;

    /**
     * The expression of the property access operation.
     */
    private expression: ParsedNode<T>;

    /**
     * The name of the property to access.
     */
    private propertyName: string;

    /**
     * Initializes a new instance of the {@linkcode PropertyAccessNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression of the property access operation.
     *
     * @param propertyName
     * The name of the property to access.
     */
    public constructor(source: T, expression: ParsedNode<T>, propertyName: string)
    {
        super(source);
        this.expression = expression;
        this.propertyName = propertyName;
    }

    /**
     * @inheritdoc
     */
    public get Expression(): ParsedNode<T>
    {
        return this.expression;
    }

    /**
     * Gets the name of the property to access.
     */
    public get PropertyName(): string
    {
        return this.propertyName;
    }

    /**
     * @inheritdoc
     */
    public override get PathPart(): PathPartCandidate<T>
    {
        return {
            type: PathKind.PropertyAccess,
            source: this.Source,
            value: this.PropertyName
        };
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
