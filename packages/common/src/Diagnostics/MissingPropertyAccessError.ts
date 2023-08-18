import { AdapterError } from "./AdapterError";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error indicating that a function parameter is missing an accessor.
 */
export class MissingPropertyAccessError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode MissingPropertyAccessError} class.
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
        return `A property of the parameter \`${this.SourceCode}\` must be accessed.`;
    }
}