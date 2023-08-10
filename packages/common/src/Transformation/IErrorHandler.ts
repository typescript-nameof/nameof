/**
 * Represents a component for reporting errors.
 *
 * @template T
 * The type of the nodes to report errors for.
 */
export interface IErrorHandler<T>
{
    /**
     * Reports the specified {@linkcode error}.
     *
     * @param item
     * The item related to the specified {@linkcode error}.
     *
     * @param error
     * The error to report.
     */
    Report(item: T, error: Error): void;
}
