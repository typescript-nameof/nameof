import { CallNodeBase } from "./CallNodeBase.cjs";
import { NodeKind } from "./NodeKind.cjs";
import { PathKind } from "./PathKind.cjs";
import { PathPartCandidate } from "./PathPartCandidate.cjs";

/**
 * Represents an interpolation node.
 */
export class InterpolationNode<T> extends CallNodeBase<T>
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
     *
     * @param typeArguments
     * The type arguments passed to the interpolation.
     *
     * @param args
     * The arguments passed to the interpolation.
     */
    public constructor(source: T, expression: T, typeArguments: readonly T[], args: readonly T[])
    {
        super(source, typeArguments, args);
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
