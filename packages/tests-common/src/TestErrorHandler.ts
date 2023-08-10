import { IErrorHandler } from "@typescript-nameof/common";

/**
 * Provides the functionality to collect errors.
 */
export class TestErrorHandler<T> implements IErrorHandler<T>
{
    /**
     * The errors which have occurred.
     */
    private errors: Error[] = [];

    /**
     * The error handler under test.
     */
    private errorHandler?: IErrorHandler<T>;

    /**
     * Initialize a new instance of the {@linkcode TestErrorHandler} class.
     *
     * @param errorHandler
     * The error handler under test.
     */
    public constructor(errorHandler?: IErrorHandler<T>)
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
    protected get ErrorHandler(): IErrorHandler<T> | undefined
    {
        return this.errorHandler;
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item related to the specified {@linkcode error}.
     *
     * @param error
     * The error to report.
     */
    public Report(item: T, error: Error): void
    {
        this.errors.push(error);
        this.ErrorHandler?.Report(item, error);
    }
}
