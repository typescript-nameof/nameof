import { AccessExpressionNode } from "./AccessExpressionNode.cjs";
import { NodeKind } from "./NodeKind.cjs";
import { ParsedNode } from "./ParsedNode.cjs";
import { PathKind } from "./PathKind.cjs";
import { PathPartCandidate } from "./PathPartCandidate.cjs";

/**
 * Represents a property access.
 */
export class PropertyAccessNode<T> extends AccessExpressionNode<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.PropertyAccessNode;

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
     * @param property
     * The property to access.
     *
     * @param propertyName
     * The name of the property to access.
     */
    public constructor(source: T, expression: ParsedNode<T>, property: ParsedNode<T>, propertyName: string)
    {
        super(source, expression, property);
        this.propertyName = propertyName;
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
}
