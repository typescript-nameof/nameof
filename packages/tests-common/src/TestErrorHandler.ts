import { IErrorHandler, INodeLocation } from "@typescript-nameof/common";

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
    private errorHandlers: Array<IErrorHandler<TNode, TContext>>;

    /**
     * Initialize a new instance of the {@linkcode TestErrorHandler} class.
     *
     * @param errorHandler
     * The error handler under test.
     */
    public constructor(...errorHandler: Array<IErrorHandler<TNode, TContext>>)
    {
        this.errorHandlers = [...errorHandler];
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
    protected get ErrorHandlers(): Array<IErrorHandler<TNode, TContext>>
    {
        return this.errorHandlers;
    }

    /**
     * @inheritdoc
     *
     * @param location
     * The location of the specified {@linkcode node}.
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
    public Report(location: INodeLocation, item: TNode, context: TContext, error: Error): void
    {
        this.errors.push(error);

        for (let errorHandler of this.ErrorHandlers)
        {
            errorHandler.Report(location, item, context, error);
        }
    }
}
