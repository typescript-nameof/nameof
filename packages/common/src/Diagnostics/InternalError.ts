/**
 * Represents an error related to a `nameof` operation.
 */
export abstract class InternalError extends Error
{
    /**
     * Gets an action to execute for handling the error.
     */
    public abstract get Action(): () => void;
}
