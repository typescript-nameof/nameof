import { NameofCallError } from "./NameofCallError";
import { NameofCall } from "../Serialization/NameofCall";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error indicating that the requested segment could not be found.
 */
export class SegmentNotFoundError<TInput, TNode, TContext> extends NameofCallError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode SegmentNotFoundError} class.
     *
     * @param adapter
     * The adapter which caused the error.
     *
     * @param call
     * The `nameof` call which caused the error.
     *
     * @param context
     * The context of the operation.
     */
    public constructor(adapter: IAdapter<TInput, TNode, TContext>, call: NameofCall<TNode>, context: TContext)
    {
        super(adapter, call, context);
    }

    /**
     * @inheritdoc
     */
    protected get Message(): string
    {
        return "The specified index is out of bounds.";
    }
}
