import { IPlainResult } from "./IPlainResult";
import { ITemplateResult } from "./ITemplateResult";

/**
 * Represents the result of a `nameof` call.
 */
export type NameofResult<T> =
    IPlainResult |
    ITemplateResult<T>;
