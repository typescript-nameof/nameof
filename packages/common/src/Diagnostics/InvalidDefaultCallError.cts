import { NameofCallError } from "./NameofCallError.cjs";
import { NameofCall } from "../Serialization/NameofCall.cjs";
import { IAdapter } from "../Transformation/IAdapter.cjs";

/**
 * Represents an error indicating an incorrect `nameof` call.
 */
export class InvalidDefaultCallError<TInput, TNode, TContext> extends NameofCallError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode InvalidDefaultCallError}.
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
        return `Expected 1 argument or 1 type argument, but got ${this.Call.arguments.length} arguments and ${this.Call.typeArguments.length} type arguments.`;
    }
}
