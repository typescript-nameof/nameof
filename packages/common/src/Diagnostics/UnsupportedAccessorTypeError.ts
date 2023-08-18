import { AdapterError } from "./AdapterError";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error indicating an invalid accessor type.
 */
export class UnsupportedAccessorTypeError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode UnsupportedAccessorTypeError} class.
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
        return `The specified expression \`${this.EscapedCode}\` is an invalid accessor type. Expected a string or a number.`;
    }
}
