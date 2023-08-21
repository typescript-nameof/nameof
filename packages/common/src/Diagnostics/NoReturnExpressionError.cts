import { AdapterError } from "./AdapterError.cjs";
import { IAdapter } from "../Transformation/IAdapter.cjs";

/**
 * Represents an error indicating that no return expression was found in a function.
 */
export class NoReturnExpressionError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode NoReturnExpressionError} class.
     *
     * @param adapter
     * The adapter which caused the error.
     *
     * @param node
     * The node related to the error.
     *
     * @param context
     * The context of the operation.
     */
    public constructor(adapter: IAdapter<TInput, TNode, TContext>, node: TNode, context: TContext)
    {
        super(adapter, node, context);
    }

    /**
     * @inheritdoc
     */
    protected get Message(): string
    {
        return "Unable to find a returned expression in the specified function.";
    }
}
