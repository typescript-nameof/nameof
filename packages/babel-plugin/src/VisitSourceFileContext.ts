import type { Node } from "@babel/types";

/**
 * The context of the transformation.
 */
export type VisitSourceFileContext = {
    /**
     * The `interpolation` calls in the current transformation.
     */
    interpolateExpressions: Set<Node>;
};
