import { Node } from "./Node.cjs";
import { NodeKind } from "./NodeKind.cjs";

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
     * The parameters of the function.
     */
    private parameters: string[];

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
     * @param parameters
     * The arguments of the function.
     *
     * @param body
     * The body of the function.
     */
    public constructor(source: T, parameters: string[], body: T)
    {
        super(source);
        this.parameters = parameters;
        this.body = body;
    }

    /**
     * Gets the parameters of the function.
     */
    public get Parameters(): string[]
    {
        return this.parameters;
    }

    /**
     * Gets the body of the function.
     */
    public get Body(): T
    {
        return this.body;
    }
}
