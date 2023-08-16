import { IAdapter } from "./IAdapter";
import { transformCallExpression } from "../transformCallExpression";

/**
 * Provides the functionality to transform `nameof` calls.
 */
export class NameofNodeTransformer<TInput, TNode, TContext>
{
    /**
     * A component for parsing and dumping `nameof` calls.
     */
    private adapter: IAdapter<TInput, TNode, TContext>;

    /**
     * Initializes a new instance of the {@linkcode NameofNodeTransformer NameofNodeTransformer<TInput, TNode, TContext>} class.
     *
     * @param adapter
     * A component for parsing and dumping `nameof` calls.
     */
    public constructor(adapter: IAdapter<TInput, TNode, TContext>)
    {
        this.adapter = adapter;
    }

    /**
     * Gets a component for parsing and dumping `nameof` calls.
     */
    protected get Adapter(): IAdapter<TInput, TNode, TContext>
    {
        return this.adapter;
    }

    /**
     * Transforms the `nameof` calls in the specified {@linkcode item}.
     *
     * @param item
     * The item to transform.
     *
     * @returns
     * The transformed {@linkcode item}.
     */
    public Transform(item: TInput): TNode | undefined
    {
        try
        {
            let node = this.Adapter.LegacyParse(item, undefined as any);

            if (node)
            {
                return this.Adapter.Dump(transformCallExpression(node), undefined as any);
            }
        }
        catch (error)
        {
            if (error instanceof Error)
            {
                this.Adapter.HandleError(error, this.Adapter.Extract(item));
            }
        }

        return undefined;
    }
}
