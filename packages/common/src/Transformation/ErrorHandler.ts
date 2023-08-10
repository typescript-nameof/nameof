import { IErrorHandler } from "./IErrorHandler";

/**
 * Provides the functionality to report errors.
 *
 * @template T
 * The type of the nodes to report errors for.
 */
export class ErrorHandler<T> implements IErrorHandler<T>
{
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
        throw error;
    }
}
