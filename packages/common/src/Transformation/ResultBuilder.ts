import { IAdapter } from "./IAdapter";
import { UnsupportedNodeError } from "../Diagnostics/UnsupportedNodeError";
import { NameofResult } from "../NameofResult";
import { ResultType } from "../ResultType";
import { PathKind } from "../Serialization/PathKind";
import { PathPart } from "../Serialization/PathPart";

/**
 * Provides the functionality to reduce a path to a single result.
 */
export class ResultBuilder<TInput, TNode, TContext>
{
    /**
     * The adapter of the result builder.
     */
    private adapter: IAdapter<TInput, TNode, TContext>;

    /**
     * The context of the operation.
     */
    private context: TContext;

    /**
     * The template parts of the result.
     */
    private templateParts: string[] = [];

    /**
     * The expressions of the result.
     */
    private expressions: TNode[] = [];

    /**
     * Gets the current template part of the result.
     */
    private current = "";

    /**
     * Initializes a new instance of the {@linkcode ResultBuilder} class.
     *
     * @param adapter
     * The adapter of the result builder.
     *
     * @param context
     * The context of the operation.
     */
    public constructor(adapter: IAdapter<TInput, TNode, TContext>, context: TContext)
    {
        this.adapter = adapter;
        this.context = context;
    }

    /**
     * Gets the built result.
     */
    public get Result(): NameofResult<TNode>
    {
        if (this.Expressions.length > 0)
        {
            return {
                type: ResultType.Template,
                templateParts: [...this.TemplateParts, this.Current],
                expressions: this.Expressions
            };
        }
        else
        {
            return {
                type: ResultType.Plain,
                text: this.Current
            };
        }
    }

    /**
     * Gets the adapter of the result builder.
     */
    protected get Adapter(): IAdapter<TInput, TNode, TContext>
    {
        return this.adapter;
    }

    /**
     * Gets the context of the operation.
     */
    protected get Context(): TContext
    {
        return this.context;
    }

    /**
     * Gets a value indicating whether the current state is empty.
     */
    protected get Empty(): boolean
    {
        return this.Current.length === 0 && this.TemplateParts.length === 0;
    }

    /**
     * Gets the template parts of the result.
     */
    protected get TemplateParts(): string[]
    {
        return this.templateParts;
    }

    /**
     * Gets the expressions of the result.
     */
    protected get Expressions(): TNode[]
    {
        return this.expressions;
    }

    /**
     * Gets or sets the current template part of the result.
     */
    protected get Current(): string
    {
        return this.current;
    }

    /**
     * @inheritdoc
     */
    protected set Current(value: string)
    {
        this.current = value;
    }

    /**
     * Adds the specified {@linkcode pathPart} to the result.
     *
     * @param pathPart
     * The part to add to the result.
     */
    public Add(pathPart: PathPart<TNode>): void
    {
        switch (pathPart.type)
        {
            case PathKind.Identifier:
            case PathKind.PropertyAccess:

                if (this.Empty)
                {
                    this.Current = pathPart.value;
                }
                else
                {
                    this.Current += `.${pathPart.value}`;
                }
                break;
            case PathKind.IndexAccess:
                this.Current += `[${JSON.stringify(pathPart.value)}]`;
                break;
            case PathKind.Interpolation:
                this.Current += "[";
                this.Push();
                this.Current += "]";
                break;
            case PathKind.Unsupported:
                throw pathPart.reason ?? new UnsupportedNodeError(this.Adapter, pathPart.source, this.Context);
        }
    }

    /**
     * Pushes the current text to the template part stack.
     */
    protected Push(): void
    {
        this.TemplateParts.push(this.Current);
        this.Current = "";
    }
}
