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

    /**
     * Gets the arguments of the function call.
     */
    protected get Arguments(): readonly TNode[]
    {
        return this.Call.arguments;
    }

    /**
     * Gets the type arguments of the function call.
     */
    protected get TypeArguments(): readonly TNode[]
    {
        return this.Call.typeArguments;
    }

    /**
     * Gets a text indicating the number of arguments.
     */
    protected get ArgumentCountText(): string
    {
        let count = this.Arguments.length;
        return `${count} argument${this.GetPluralSuffix(count)}`;
    }

    /**
     * Gets a text indicating the number of type arguments.
     */
    protected get TypeArgumentCountText(): string
    {
        let count = this.TypeArguments.length;
        return `${count} type argument${this.GetPluralSuffix(count)}`;
    }

    /**
     * Gets the proper plural suffix for the specified {@linkcode amount} of entities.
     *
     * @param amount
     * The number of entities to get the plural suffix for.
     *
     * @returns
     * The proper suffix for the specified {@linkcode amount}.
     */
    protected GetPluralSuffix(amount: number): string
    {
        if (amount === 1)
        {
            return "";
        }
        else
        {
            return "s";
        }
    }
}
