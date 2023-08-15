import { Node } from "./Node";
import { NodeKind } from "./NodeKind";

/**
 * Represents a function node.
 */
export class FunctionNode<T> extends Node<T>
{
    /**
     * @inheritdoc
     */
    public readonly Type = NodeKind.FunctionNode;

    /**
     * The arguments of the function.
     */
    private arguments: T[];

    /**
     * The body of the function.
     */
    private body: T;

    /**
     * Initializes a new instance of the {@linkcode FunctionNode} class.
     *
     * @param source
     * The source of the node.
     *
     * @param args
     * The arguments of the function.
     *
     * @param body
     * The body of the function.
     */
    public constructor(source: T, args: T[], body: T)
    {
        super(source);
        this.arguments = args;
        this.body = body;
    }

    /**
     * Gets the arguments of the function.
     */
    public get Arguments(): T[]
    {
        return this.arguments;
    }

    /**
     * Gets the body of the function.
     */
    public get Body(): T
    {
        return this.body;
    }
}
