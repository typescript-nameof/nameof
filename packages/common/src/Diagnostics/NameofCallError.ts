import { AdapterError } from "./AdapterError";
import { NameofCall } from "../Serialization/NameofCall";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error which is related to a {@linkcode NameofCall}.
 */
export abstract class NameofCallError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * The function call related to the error.
     */
    private call: NameofCall<TNode>;

    /**
     * Initializes a new instance of the {@linkcode NameofCallError}.
     *
     * @param adapter
     * The adapter which caused the error.
     *
     * @param call
     * The function call related to the error.
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
     * Gets the function call related to the error.
     */
    protected get Call(): NameofCall<TNode>
    {
        return this.call;
    }
}
