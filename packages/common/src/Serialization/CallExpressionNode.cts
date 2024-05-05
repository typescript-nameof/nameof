import { CallNodeBase } from "./CallNodeBase.cjs";
import { NodeKind } from "./NodeKind.cjs";

/**
 * Represents a call expression node.
 */
export class CallExpressionNode<T> extends CallNodeBase<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.CallExpressionNode;

    /**
     * The expression to call.
     */
    private expression: T;

    /**
     * Initializes a new instance of the {@linkcode CallExpressionNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param expression
     * The expression to call.
     *
     * @param typeArguments
     * The type arguments of the call.
     *
     * @param args
     * The arguments of the call.
     */
    public constructor(source: T, expression: T, typeArguments: readonly T[], args: readonly T[])
    {
        super(source, typeArguments, args);
        this.expression = expression;
    }

    /**
     * Gets the expression to call.
     */
    public get Expression(): T
    {
        return this.expression;
    }
}
