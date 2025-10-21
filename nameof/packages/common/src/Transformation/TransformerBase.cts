import { IAdapter } from "./IAdapter.cjs";
import { ITransformationContext } from "./ITransformationContext.cjs";
import { TransformAction } from "./TransformAction.cjs";
import { TransformerFeatures } from "./TransformerFeatures.cjs";
import { MissingPropertyAccessError } from "../Diagnostics/MissingPropertyAccessError.cjs";
import { UnusedInterpolationError } from "../Diagnostics/UnusedInterpolationError.cjs";

/**
 * Provides a basic implementation of a transformer.
 *
 * @template TNode
 * The type of the nodes to transform.
 *
 * @template TFeatures
 * The type of the features
 */
export abstract class TransformerBase<TInput, TNode, TContext extends ITransformationContext<TNode>, TFeatures extends TransformerFeatures<TNode, TContext>>
{
    /**
     * The adapter for transforming nodes.
     */
    private adapter?: IAdapter<TInput, TNode, TContext>;

    /**
     * A set of features for performing transformations.
     */
    private features: TFeatures;

    /**
     * Initializes a new instance of the {@linkcode TransformerBase TransformerBase<TNode, TFeatures>} class.
     *
     * @param features
     * A set of features for performing transformations.
     */
    public constructor(features: TFeatures)
    {
        this.features = features;
    }

    /**
     * Gets the adapter for transforming nodes.
     */
    protected get Adapter(): IAdapter<TInput, TNode, TContext>
    {
        if (!this.adapter)
        {
            this.adapter = this.InitializeAdapter();
        }

        return this.adapter;
    }

    /**
     * Gets a set of features for performing transformations.
     */
    protected get Features(): TFeatures
    {
        return this.features;
    }

    /**
     * Initializes an adapter.
     */
    protected abstract InitializeAdapter(): IAdapter<TInput, TNode, TContext>;

    /**
     * Monitors the transformation in the specified {@linkcode action} for errors.
     *
     * @param action
     * The action to monitor.
     *
     * @returns
     * The result of the action.
     */
    protected MonitorTransformation<T>(action: TransformAction<TNode, T>): T
    {
        let context: ITransformationContext<TNode> = {
            interpolationCalls: []
        };

        let result = action(context);
        let remainingInterpolationCall = context.interpolationCalls?.[0];
        let remainingTypedCall = context.typedCalls?.[0];

        if (remainingInterpolationCall)
        {
            new UnusedInterpolationError(this.Adapter, remainingInterpolationCall, context).ReportAction();
        }

        if (remainingTypedCall)
        {
            new MissingPropertyAccessError(this.Adapter, remainingTypedCall, context).ReportAction();
        }

        return result;
    }
}
