import { NameofError } from "./NameofError";
import { IAdapter } from "../Transformation/IAdapter";

/**
 * Represents an error that occurred in an adapter.
 *
 * @template TInput
 * The type of the input of the adapter.
 *
 * @template TOutput
 * The type of the output of the adapter.
 */
export abstract class AdapterError<TInput, TNode, TContext> extends NameofError
{
    /**
     * The adapter which caused the error.
     */
    private adapter: IAdapter<TInput, TNode, TContext>;

    /**
     * The node related to the error.
     */
    private node: TNode;

    /**
     * The context of the operation.
     */
    private context: TContext;

    /**
     * Initializes a new instance of the {@linkcode AdapterError} class.
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
        super();
        this.adapter = adapter;
        this.node = node;
        this.context = context;
    }

    /**
     * @inheritdoc
     */
    public get Action(): () => void
    {
        return () => this.Report();
    }

    /**
     * Gets the adapter which caused the error.
     */
    protected get Adapter(): IAdapter<TInput, TNode, TContext>
    {
        return this.adapter;
    }

    /**
     * Gets the node related to the error.
     */
    protected get Node(): TNode
    {
        return this.node;
    }

    /**
     * Gets the context of the operation.
     */
    protected get Context(): TContext
    {
        return this.context;
    }

    /**
     * Gets the expected name of nameof function calls.
     */
    protected get NameofName(): string
    {
        return this.Adapter.GetNameofName(this.Context);
    }

    /**
     * Gets the source code which caused the error.
     */
    protected get SourceCode(): string
    {
        return this.Adapter.GetSourceCode(this.Node, this.Context);
    }

    /**
     * Gets an escaped representation of the {@linkcode SourceCode}.
     */
    protected get EscapedCode(): string
    {
        return this.SourceCode.replace(/([\\`])/g, "\\$1");
    }

    /**
     * The message of the error.
     */
    protected abstract get Message(): string;

    /**
     * Reports the error.
     */
    protected Report(): void
    {
        this.Adapter.ReportError(this.Node, this.Context, new Error(this.Message));
    }
}
