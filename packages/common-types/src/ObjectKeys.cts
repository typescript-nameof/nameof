/**
 * Represents an object providing the keys of the specified type {@linkcode T}.
 */
export type ObjectKeys<T> = {
    [K in keyof T]: K
};
