import * as ts from "typescript";

/**
 * The context of the transformation.
 */
export type VisitSourceFileContext = {
    /**
     * The `interpolation` calls in the current transformation.
     */
    interpolateExpressions: Set<ts.Node>;
};
