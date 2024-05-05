import { Node } from "./Node.cjs";

/**
 * Represents a call expression node.
 */
export abstract class CallNodeBase<T> extends Node<T>
{
    /**
     * The type arguments of the call.
     */
    private typeArguments: readonly T[];

    /**
     * The arguments of the call.
     */
    private arguments: readonly T[];

    /**
     * Initializes a new instance of the {@linkcode CallNodeBase} class.
     *
     * @param source
     * The source of the node.
     *
     * @param typeArguments
     * The type arguments of the call.
     *
     * @param args
     * The arguments of the call.
     */
    public constructor(source: T, typeArguments: readonly T[], args: readonly T[])
    {
        super(source);
        this.typeArguments = typeArguments;
        this.arguments = args;
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
