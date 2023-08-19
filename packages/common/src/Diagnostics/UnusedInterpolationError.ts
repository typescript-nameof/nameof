import { AdapterError } from "./AdapterError";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error indicating an unused `nameof.interpolate` call.
 */
export class UnusedInterpolationError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
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
        return `The interpolation call \`${this.EscapedCode}\` is unused. Expected interpolation calls to be used inside a \`${this.NameofName}.full\` call.`;
    }
}
