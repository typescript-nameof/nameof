import { NameofCallError } from "./NameofCallError.cjs";
import { NameofCall } from "../Serialization/NameofCall.cjs";
import { IAdapter } from "../Transformation/IAdapter.cjs";

/**
 * Represents an error indicating an invalid segmented `nameof.full` or `nameof.split` call.
 */
export class InvalidSegmentCallError<TInput, TNode, TContext> extends NameofCallError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode InvalidSegmentCallError}.
     *
     * @param adapter
     * The adapter which caused the error.
     *
     * @param call
     * The `nameof` call related to the error.
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
        return `This \`${this.Call.function}\` call is invalid. Got ${this.ArgumentCountText} and ${this.TypeArgumentCountText}. Please make sure to pass 1 argument or 1 type argument to transform.`;
    }
}
