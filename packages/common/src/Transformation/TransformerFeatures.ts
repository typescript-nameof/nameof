import { ErrorHandler } from "./ErrorHandler";
import { IErrorHandler } from "./IErrorHandler";
import { INodeLocation } from "./INodeLocation";

/**
 * Provides features for performing `nameof` transformations.
 */
export class TransformerFeatures<TNode, TContext = Record<string, never>>
{
    /**
     * A component for reporting errors.
     */
    private errorHandler: IErrorHandler<TNode, TContext> | undefined;

    /**
     * Initializes a new instance of the {@linkcode TransformerFeatures TransformerFeatures<T>} class.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(errorHandler?: IErrorHandler<TNode, TContext>)
    {
        this.errorHandler = errorHandler;
    }

    /**
     * Gets a component for reporting errors.
     */
    protected get ErrorHandler(): IErrorHandler<TNode, TContext> | undefined
    {
        if (!this.errorHandler)
        {
            this.errorHandler = this.InitializeErrorHandler();
        }

        return this.errorHandler;
    }

    /**
     * Reports the specified {@linkcode error}.
     *
     * @param location
     * The location of the specified {@linkcode node}.
     *
     * @param item
     * The item the specified {@linkcode error} is related to.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to report.
     */
    public ReportError(location: INodeLocation, item: TNode, context: TContext, error: Error): void
    {
        this.ErrorHandler?.Report(location, item, context, error);
    }

    /**
     * Initializes a new error handler.
     *
     * @returns
     * The newly created error handler.
     */
    protected InitializeErrorHandler(): IErrorHandler<TNode, TContext>
    {
        return new ErrorHandler();
    }
}
