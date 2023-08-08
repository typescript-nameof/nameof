import { IAdapter } from "./IAdapter";
import { transformCallExpression } from "../transformCallExpression";

/**
 * Provides the functionality to transform `nameof` calls.
 */
export class NameofTransformer<TInput, out TOutput = TInput>
{
    /**
     * A component for parsing and dumping `nameof` calls.
     */
    private adapter: IAdapter<TInput, TOutput>;

    /**
     * Initializes a new instance of the {@linkcode NameofTransformer NameofTransformer<TInput, TOutput>} class.
     *
     * @param adapter
     * A component for parsing and dumping `nameof` calls.
     */
    public constructor(adapter: IAdapter<TInput, TOutput>)
    {
        this.adapter = adapter;
    }

    /**
     * Gets a component for parsing and dumping `nameof` calls.
     */
    protected get Adapter(): IAdapter<TInput, TOutput>
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
    public Transform(item: TInput): TOutput | undefined
    {
        try
        {
            let node = this.Adapter.Parse(item);

            if (node)
            {
                return this.Adapter.Dump(transformCallExpression(node));
            }
        }
        catch (error)
        {
            if (error instanceof Error)
            {
                this.Adapter.HandleError(error, item);
            }
        }

        return undefined;
    }
}
