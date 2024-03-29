import { Node } from "./Node.cjs";
import { NodeKind } from "./NodeKind.cjs";
import { PathKind } from "./PathKind.cjs";
import { PathPartCandidate } from "./PathPartCandidate.cjs";

/**
 * Represents an interpolation node.
 */
export class InterpolationNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.InterpolationNode;

    /**
     * The expression to interpolate.
     */
    private expression: T;

    /**
     * Initializes a new instance of the {@linkcode InterpolationNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression to interpolate.
     */
    public constructor(source: T, expression: T)
    {
        super(source);
        this.expression = expression;
    }

    /**
     * Gets the expression to interpolate.
     */
    public get Expression(): T
    {
        return this.expression;
    }

    /**
     * @inheritdoc
     */
    public override get PathPart(): PathPartCandidate<T>
    {
        return {
            type: PathKind.Interpolation,
            source: this.Source,
            node: this.Expression
        };
    }
}
