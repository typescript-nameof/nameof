/**
 * Represents the context of a transformation.
 */
export interface ITransformationContext<T>
{
    /**
     * The unused typed calls.
     */
    typedCalls?: T[];

    /**
     * The unused interpolation calls.
     */
    interpolationCalls?: T[];
}
