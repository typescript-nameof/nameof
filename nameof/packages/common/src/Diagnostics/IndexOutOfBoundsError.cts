import { AdapterError } from "./AdapterError.cjs";
import { NumericLiteralNode } from "../Serialization/NumericLiteralNode.cjs";
import { IAdapter } from "../Transformation/IAdapter.cjs";

/**
 * Represents an error indicating that the requested index is out of bounds.
 */
export class IndexOutOfBoundsError<TInput, TNode, TContext> extends AdapterError<TInput, TNode, TContext>
{
    /**
     * The node containing the invalid index.
     */
    private indexNode: NumericLiteralNode<TNode>;

    /**
     * The number of available segments.
     */
    private segmentCount: number;

    /**
     * Initializes a new instance of the {@linkcode IndexOutOfBoundsError} class.
     *
     * @param adapter
     * The adapter which caused the error.
     *
     * @param indexNode
     * The node containing the invalid index.
     *
     * @param segmentCount
     * The number of available segments.
     *
     * @param context
     * The context of the operation.
     */
    public constructor(adapter: IAdapter<TInput, TNode, TContext>, indexNode: NumericLiteralNode<TNode>, segmentCount: number, context: TContext)
    {
        super(adapter, indexNode.Source, context);
        this.indexNode = indexNode;
        this.segmentCount = Math.abs(segmentCount);
    }

    /**
     * Gets the node containing the invalid index.
     */
    protected get IndexNode(): NumericLiteralNode<TNode>
    {
        return this.indexNode;
    }

    /**
     * Gets the invalid index.
     */
    protected get Index(): number
    {
        return this.IndexNode.Value;
    }

    /**
     * Gets the number of available segments.
     */
    protected get SegmentCount(): number
    {
        return this.segmentCount;
    }

    /**
     * @inheritdoc
     */
    protected get Message(): string
    {
        let expectation: string;

        if (this.SegmentCount === 0)
        {
            expectation = "0";
        }
        else
        {
            expectation = `a value between ${-this.SegmentCount} and ${this.SegmentCount - 1}`;
        }

        return `The specified index is invalid. Expected ${expectation}, but got ${this.Index}`;
    }
}
