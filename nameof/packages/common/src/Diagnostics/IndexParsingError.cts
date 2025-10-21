import { AdapterError } from "./AdapterError.cjs";
import { IAdapter } from "../Transformation/IAdapter.cjs";

/**
 * Represents an error indicating a paring issue.
 */
export class IndexParsingError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * Initializes a new instance of the {@linkcode IndexParsingError} class.
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
        return `Unable to parse the number from the specified expression \`${this.EscapedCode}\`.`;
    }
}
