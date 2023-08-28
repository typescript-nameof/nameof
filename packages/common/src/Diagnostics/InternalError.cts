/**
 * Represents an error related to a `nameof` operation.
 */
export abstract class InternalError extends Error
{
    /**
     * Gets an action for reporting the error.
     */
    public abstract get ReportAction(): () => void;
}
