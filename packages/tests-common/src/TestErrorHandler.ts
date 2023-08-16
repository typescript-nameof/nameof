import { IErrorHandler } from "@typescript-nameof/common";

/**
 * Provides the functionality to collect errors.
 */
export class TestErrorHandler<TNode, TContext> implements IErrorHandler<TNode, TContext>
{
    /**
     * The errors which have occurred.
     */
    private errors: Error[] = [];

    /**
     * The error handler under test.
     */
    private errorHandler?: IErrorHandler<TNode, TContext>;

    /**
     * Initialize a new instance of the {@linkcode TestErrorHandler} class.
     *
     * @param errorHandler
     * The error handler under test.
     */
    public constructor(errorHandler?: IErrorHandler<TNode, TContext>)
    {
        this.errorHandler = errorHandler;
    }

    /**
     * Gets the errors which have occurred.
     */
    public get Errors(): readonly Error[]
    {
        return this.errors;
    }

    /**
     * Gets the error handler under test.
     */
    protected get ErrorHandler(): IErrorHandler<TNode, TContext> | undefined
    {
        return this.errorHandler;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item related to the specified {@linkcode error}.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to report.
     */
    public Report(item: TNode, context: TContext, error: Error): void
    {
        this.errors.push(error);
        this.ErrorHandler?.Report(item, context, error);
    }
}
