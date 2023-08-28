/**
 * Represents the context of a transformation.
 */
export interface ITransformationContext<T>
{
    /**
     * The unused interpolation calls.
     */
    interpolationCalls?: T[];
}
