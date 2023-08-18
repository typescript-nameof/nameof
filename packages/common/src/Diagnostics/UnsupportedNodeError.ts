import { AdapterError } from "./AdapterError";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error indicating that an unsupported node was found.
 */
export class UnsupportedNodeError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode UnsupportedNodeError} class.
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
        if (this.Adapter.IsMutated(this.Node, this.Context))
        {
            return "Nested `nameof()` calls are not supported.";
        }
        else
        {
            return `The expression \`${this.SourceCode}\` is not supported.`;
        }
    }
}
