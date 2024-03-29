import { Node } from "./Node.cjs";
import { NodeKind } from "./NodeKind.cjs";

/**
 * Represents a call expression node.
 */
export class CallExpressionNode<T> extends Node<T>
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
     * The type arguments of the call.
     */
    private typeArguments: readonly T[];

    /**
     * The arguments of the call.
     */
    private arguments: readonly T[];

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
        super(source);
        this.expression = expression;
        this.typeArguments = typeArguments;
        this.arguments = args;
    }

    /**
     * Gets the expression to call.
     */
    public get Expression(): T
    {
        return this.expression;
    }

    /**
     * Gets the type arguments of the call.
     */
    public get TypeArguments(): readonly T[]
    {
        return this.typeArguments;
    }

    /**
     * Gets the arguments of the call.
     */
    public get Arguments(): readonly T[]
    {
        return this.arguments;
    }
}
