import { INamedPathPart } from "./INamedPathPart";
import { PathKind } from "./PathKind";

/**
 * Represents an identifier.
 */
export interface IIdentifier extends INamedPathPart<string>
{
    /**
     * @inheritdoc
     */
    type: PathKind.Identifier;
}
