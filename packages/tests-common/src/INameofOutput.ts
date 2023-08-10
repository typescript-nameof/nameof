/**
 * Represents the result of a `nameof` transformation.
 */
export interface INameofOutput
{
    /**
     * The errors which occurred during the transformation.
     */
    errors: Error[];

    /**
     * The transformed code.
     */
    output?: string;
}
