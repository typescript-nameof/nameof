import { AdapterError } from "./AdapterError.cjs";
import { IAdapter } from "../Transformation/IAdapter.cjs";

/**
 * Represents an error with a custom error message.
 */
export class CustomError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * A message which describes the issue.
     */
    private customMessage: string;

    /**
     * Initializes a new instance of the {@linkcode CustomError} class.
     *
     * @param adapter
     * The adapter which caused the error.
     *
     * @param node
     * The node related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param message
     * A message which describes the issue.
     */
    public constructor(adapter: IAdapter<TInput, TNode, TContext>, node: TNode, context: TContext, message: string)
    {
        super(adapter, node, context);
        this.customMessage = message;
    }

    /**
     * @inheritdoc
     */
    protected get Message(): string
    {
        return this.customMessage;
    }
}
