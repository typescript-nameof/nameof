// eslint-disable-next-line node/no-unpublished-import
import type { Node } from "@babel/core";
import { ErrorHandler } from "@typescript-nameof/common";
import { BabelContext } from "./Transformation/BabelContext";

/**
 * Provides the functionality to handle errors for babel.
 */
export class BabelErrorHandler extends ErrorHandler<Node, BabelContext>
{

}
