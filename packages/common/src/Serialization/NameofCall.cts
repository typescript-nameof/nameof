/**
 * Represents a `nameof` call.
 */
export type NameofCall<T> = {
    /**
     * The source of the call.
     */
    source: T;

    /**
     * The `nameof` function to invoke.
     */
    function?: string;

    /**
     * The type arguments of the call.
     */
    typeArguments: readonly T[];

    /**
     * The arguments of the call.
     */
    arguments: readonly T[];
};
