/**
 * Represents the result of a `nameof` transformation.
 */
export interface INameofOutput
{
    /**
     * The error which occurred during the transformation.
     */
    error?: Error;

    /**
     * The transformed code.
     */
    output?: string;
}
