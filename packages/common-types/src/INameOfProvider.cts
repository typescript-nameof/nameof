import { KeyProvider } from "./KeyProvider.cjs";

/**
 * Represents a component for determining variable- and type names.
 */
export interface INameOfProvider
{
    /**
     * Gets a string representation of the final identifier of the given expression.
     *
     * @example nameof<MyInterface>() -> "MyInterface"
     * @example nameof<Array<MyInterface>>() -> "Array"
     * @example nameof<MyNamespace.MyInnerInterface>() -> "MyInnerInterface"
     * @example nameof<MyInterface>(o => o.prop) -> "prop"
     *
     * @param func An optional function for which the last identifier of the expression will be parsed.
     */
    <T>(func?: (obj: T) => unknown): string;

    /**
     * Gets a string representation of the last identifier of the given expression.
     *
     * @example nameof(console) -> "console"
     * @example nameof(console.log) -> "log"
     * @example nameof(console["warn"]) -> "warn"
     *
     * @param obj An expression for which the last identifier will be parsed.
     */
    (obj: unknown): string;

    /**
     * Gets constantly typed keys of the specified type {@linkcode T}.
     */
    typed<T>(): KeyProvider<T>;

    /**
     * Gets constantly typed keys of the object returned by the specified {@linkcode func}.
     *
     * @param func
     * The function providing the object to get a key for.
     */
    typed<TFunc extends (...args: unknown[]) => unknown>(func: TFunc): TFunc extends (...args: unknown[]) => infer U ? KeyProvider<U> : never;

    /**
     * Gets the string representation of the entire type parameter expression.
     *
     * @example nameof.full<MyNamespace.MyInnerInterface>() -> "MyNamespace.MyInnerInterface"
     * @example nameof.full<MyNamespace.MyInnerInterface>(1) -> "MyInnerInterface"
     * @example nameof.full<Array<MyInterface>>() -> "Array"
     * @example nameof.full<MyNamespace.AnotherNamespace.MyInnerInterface>>(-1) -> "MyInnerInterface"
     *
     * @param periodIndex Specifies the index of the part of the expression to parse.
     * When absent, the full expression will be parsed.
     * A negative index can be used, indicating an offset from the end of the sequence.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    full<T>(periodIndex?: number): string;

    /**
     * Gets the string representation of the entire resultant expression.
     *
     * @example nameof.full<MyInterface>(o => o.prop.prop2) -> "prop.prop2"
     * @example nameof.full<MyInterface>(o => o.prop.prop2.prop3, 1) -> "prop2.prop3"
     * @example nameof.full<MyInterface>(o => o.prop.prop2.prop3, -1) -> `"prop3"
     *
     * @param func A function for which the result will be parsed, excluding the parameter's identifier.
     * @param periodIndex Specifies the index of the part of the expression to parse.
     * When absent, the full expression will be parsed.
     * A negative index can be used, indicating an offset from the end of the sequence.
     */
    full<T>(func: (obj: T) => unknown, periodIndex?: number): string;

    /**
     * Gets the string representation of the entire given expression.
     *
     * @example nameof.full(console.log) -> "console.log"
     * @example nameof.full(window.alert.length, -1) -> "length"
     * @example nameof.full(window.alert.length, 2) -> "length"
     *
     * @param obj The expression which will be parsed.
     * @param periodIndex Specifies the index of the part of the expression to parse.
     * When absent, the full expression will be parsed.
     * A negative index can be used, indicating an offset from the end of the sequence.
     */
    full(obj: unknown, periodIndex?: number): string;

    /**
     * Gets an array containing the string representation of the final identifier of each expression in the array returned by the provided function.
     *
     * @example nameof.toArray<MyType>(o => [o.firstProp, o.otherProp.secondProp, o.other]) -> ["firstProp", "secondProp", "other"]
     * @example nameof.toArray<MyType>(o => [o.prop, nameof.full(o.myProp.otherProp, 1)]) -> ["prop", "myProp.otherProp"]
     *
     * @param func A function returning an array of expressions to be parsed, excluding the parameter's identifier.
     */
    array<T>(func: (obj: T) => unknown[]): string[];

    /**
     * Gets an array containing the string representation of each expression in the arguments.
     *
     * @example nameof.toArray(myObject, otherObject) -> ["myObject", "otherObject"]
     * @example nameof.toArray(obj.firstProp, obj.secondProp, otherObject, nameof.full(obj.other)) -> ["firstProp", "secondProp", "otherObject", "obj.other"]
     *
     * @param args An array of expressions to be parsed.
     */
    array(...args: unknown[]): string[];

    /**
     * Gets an array containing the string representation of the final identifier of each expression in the array returned by the provided function.
     *
     * @example nameof.toArray<MyType>(o => [o.firstProp, o.otherProp.secondProp, o.other]) -> ["firstProp", "secondProp", "other"]
     * @example nameof.toArray<MyType>(o => [o.prop, nameof.full(o.myProp.otherProp, 1)]) -> ["prop", "myProp.otherProp"]
     *
     * @param func A function returning an array of expressions to be parsed, excluding the parameter's identifier.
     * @deprecated
     */
    toArray<T>(func: (obj: T) => unknown[]): string[];

    /**
     * Gets an array containing the string representation of each expression in the arguments.
     *
     * @example nameof.toArray(myObject, otherObject) -> ["myObject", "otherObject"]
     * @example nameof.toArray(obj.firstProp, obj.secondProp, otherObject, nameof.full(obj.other)) -> ["firstProp", "secondProp", "otherObject", "obj.other"]
     *
     * @param args An array of expressions to be parsed.
     * @deprecated
     */
    toArray(...args: unknown[]): string[];

    /**
     * Embeds an expression into the string representation of the result of nameof.full.
     *
     * @example nameof.full(myObj.prop[nameof.interpolate(i)]) -> `myObj.prop[${i}]`
     *
     * @param value The value to interpolate.
     */
    interpolate<T>(value: T): T;

    /**
     * Gets an array of strings where each element is a subsequent part of the expression provided.
     *
     * @example nameof.split<MyInterface>(o => o.prop.prop2.prop3) -> ["prop", "prop2", "prop3"]
     * @example nameof.split<MyInterface>(o => o.prop.prop2.prop3, 1) -> ["prop2", "prop3"]
     * @example nameof.split<MyInterface>(o => o.prop.prop2.prop3, -1) -> ["prop", "prop2"]
     *
     * @param func A function for which the resultant parts will be parsed, excluding the parameter's identifier.
     * @param periodIndex Specifies the index of the part of the expression to parse.
     * When absent, the full expression will be parsed.
     * A negative index can be used, indicating an offset from the end of the sequence.
     */
    split<T>(func: (obj: T) => unknown, periodIndex?: number): string[];

    /**
     * Gets an array of strings where each element is a subsequent part of the expression provided.
     *
     * @example nameof.split(myObj.prop.prop2.prop3) -> ["myObj", "prop", "prop2", "prop3"]
     * @example nameof.split(myObj.prop.prop2.prop3, -3);`, `["prop", "prop2", "prop3"];
     * @example nameof.split(myObj.prop.prop2.prop3, 2);`, `["prop2", "prop3"]
     *
     * @param obj An expression for which the parts will be parsed.
     * @param periodIndex Specifies the index of the part of the expression to parse.
     * When absent, the full expression will be parsed.
     * A negative index can be used, indicating an offset from the end of the sequence.
     */
    split(obj: unknown, periodIndex?: number): string[];
}
