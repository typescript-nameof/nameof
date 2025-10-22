import { ObjectKeys } from "./ObjectKeys.cjs";

/**
 * Represents an object providing the keys of the specified type {@linkcode T}.
 */
export type KeyProvider<T> = (
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    T extends (...args: any[]) => any ? ObjectKeys<Function> : unknown
) & ObjectKeys<T>;
