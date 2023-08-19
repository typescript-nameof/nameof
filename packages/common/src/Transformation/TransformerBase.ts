import { TransformAction } from "./TransformAction";
import { TransformerFeatures } from "./TransformerFeatures";
import { UnusedInterpolationError } from "../Diagnostics/UnusedInterpolationError";
import { IAdapter } from "../Transformation/IAdapter";
import { ITransformationContext } from "../Transformation/ITransformationContext";

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
     * Monitors the `nameof.interpolate` calls during the execution of the specified {@linkcode action}.
     *
     * @param action
     * The action to execute.
     *
     * @returns
     * The result of the action.
     */
    protected MonitorInterpolations<T>(action: TransformAction<TNode, T>): T
    {
        let context: ITransformationContext<TNode> = {
            interpolationCalls: []
        };

        let result = action(context);
        let remainingCall = context.interpolationCalls?.[0];

        if (remainingCall)
        {
            new UnusedInterpolationError(this.Adapter, remainingCall, context).ReportAction();
        }

        return result;
    }
}
