import { IAdapter } from "./IAdapter";
import { NameofCallExpression, Node } from "../Serialization/nodes";

/**
 * Provides the functionality to parse and dump `nameof` expressions.
 */
export abstract class Adapter<TInput, out TOutput = TInput> implements IAdapter<TInput, TOutput>
{
    /**
     * @inheritdoc
     *
     * @param item
     * The item to parse.
     */
    public abstract Parse(item: TInput): NameofCallExpression | undefined;

    /**
     * @inheritdoc
     *
     * @param node
     * The node to dump.
     */
    public abstract Dump(node: Node): TOutput;

    /**
     * @inheritdoc
     *
     * @param error
     * The error to handle.
     *
     * @param item
     * The item related to the error.
     */
    public HandleError(error: Error, item: TInput): void
    {
        throw error;
    }
}
