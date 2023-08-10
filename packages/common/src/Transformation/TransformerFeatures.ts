import { IErrorHandler } from "./IErrorHandler";

/**
 * Provides features for performing `nameof` transformations.
 */
export class TransformerFeatures<T>
{
    /**
     * A component for reporting errors.
     */
    private errorHandler: IErrorHandler<T>;

    /**
     * Initializes a new instance of the {@linkcode TransformerFeatures TransformerFeatures<T>} class.
     *
     * @param errorHandler
     * A component for reporting errors.
     */
    public constructor(errorHandler: IErrorHandler<T>)
    {
        this.errorHandler = errorHandler;
    }

    /**
     * Gets a component for reporting errors.
     */
    protected get ErrorHandler(): IErrorHandler<T>
    {
        return this.errorHandler;
    }

    /**
     * Reports the specified {@linkcode error}.
     *
     * @param item
     * The item the specified {@linkcode error} is related to.
     *
     * @param error
     * The error to report.
     */
    public ReportError(item: T, error: Error): void
    {
        this.ErrorHandler.Report(item, error);
    }
}
