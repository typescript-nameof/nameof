import { AdapterError } from "./AdapterError";
import { NameofCall } from "../Serialization/NameofCall";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error indicating that the number of elements to dump is out of bounds.
 */
export class OutOfBoundsError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * The `nameof` call which caused the error.
     */
    private call: NameofCall<TNode>;

    /**
     * Initializes a new instance of the {@linkcode NoSingleArgumentError} class.
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
        super(adapter, call.source, context);
        this.call = call;
    }

    /**
     * Gets the `nameof` call which caused the error.
     */
    protected get Call(): NameofCall<TNode>
    {
        return this.call;
    }

    /**
     * @inheritdoc
     */
    protected get Message(): string
    {
        return "The specified index is out of bounds.";
    }
}
