import { ResultType } from "./ResultType.cjs";

/**
 * Represents a result of a `nameof` call.
 */
export interface IResult
{
    /**
     * The type of the result.
     */
    type: ResultType;
}
