import { NameofCallError } from "./NameofCallError.cjs";
import { NameofCall } from "../Serialization/NameofCall.cjs";
import { IAdapter } from "../Transformation/IAdapter.cjs";

/**
 * Represents an error indicating an invalid `interpolate` call.
 */
export class InvalidArgumentCountError<TInput, TNode, TContext> extends NameofCallError<TInput, TNode, TContext>
{
    /**
     * The expected number of arguments.
     */
    private expected: number;

    /**
     * Initializes a new instance of the {@linkcode NoSingleArgumentError} class.
     *
     * @param adapter
     * The adapter which caused the error.
     *
     * @param call
     * The `nameof` call which caused the error.
     *
     * @param expected
     * The expected number of arguments.
     *
     * @param context
     * The context of the operation.
     */
    public constructor(adapter: IAdapter<TInput, TNode, TContext>, call: NameofCall<TNode>, expected: number, context: TContext)
    {
        super(adapter, call, context);
        this.expected = expected;
    }

    /**
     * Gets the expected number of arguments.
     */
    protected get Expected(): number
    {
        return this.expected;
    }

    /**
     * @inheritdoc
     */
    protected get Message(): string
    {
        return `Expected ${this.Expected} argument for the \`${this.FunctionName}\` call, but got ${this.Call.arguments.length}.`;
    }
}
