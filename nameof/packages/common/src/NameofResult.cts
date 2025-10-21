import { INodeResult } from "./INodeResult.cjs";
import { IPlainResult } from "./IPlainResult.cjs";
import { ITemplateResult } from "./ITemplateResult.cjs";

/**
 * Represents the result of a `nameof` call.
 */
export type NameofResult<T> =
    IPlainResult |
    ITemplateResult<T> |
    INodeResult<T>;
