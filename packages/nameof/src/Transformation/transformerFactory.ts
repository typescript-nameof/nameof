import { NameofNodeTransformer, throwError, throwErrorForSourceFile } from "@typescript-nameof/common";
import * as ts from "typescript";
import { getNodeText } from "./helpers";
import { TransformResult } from "./transform";
import { TypeScriptAdapter } from "./TypeScriptAdapter";
import { TypeScriptFeatures } from "./TypeScriptFeatures";
import { VisitSourceFileContext } from "./VisitSourceFileContext";

/**
 * Creates a component for transforming files.
 *
 * @param context
 * The context of the transformation.
 *
 * @returns
 * A component for transforming source files.
 */
export const transformerFactory: ts.TransformerFactory<ts.SourceFile> = context =>
{
    return file => visitSourceFile(file, context);
};

/**
 * Transforms the specified {@link sourceFile `sourceFile`}.
 *
 * @param sourceFile
 * The file to transform.
 *
 * @param context
 * The context of the transformation.
 *
 * @returns
 * The transformed source file.
 */
export function visitSourceFile(sourceFile: ts.SourceFile, context: ts.TransformationContext): ts.SourceFile
{
    let adapter = new TypeScriptAdapter(new TypeScriptFeatures());
    let transformer = new NameofNodeTransformer(adapter);

    /**
     * Transforms the specified {@link node `node`} and its children.
     *
     * @param node
     * The node to transform.
     *
     * @returns
     * The transformed node.
     */
    function visitNodeAndChildren(node: ts.Node): ts.Node
    {
        if (node === undefined)
        {
            return node;
        }

        // visit the children in post order
        node = ts.visitEachChild(node, childNode => visitNodeAndChildren(childNode), context);
        return visitNode(transformer, node);
    }

    try
    {
        const result = visitNodeAndChildren(sourceFile) as ts.SourceFile;
        throwIfContextHasInterpolateExpressions(adapter.Context, sourceFile);
        return result;
    }
    catch (err: any)
    {
        return throwErrorForSourceFile(err.message, sourceFile.fileName);
    }
}

/**
 * Throws an error if there are too many `interpolate` expressions.
 *
 * @param context
 * The context of the transformation.
 *
 * @param sourceFile
 * The source file which is being transformed.
 */
export function throwIfContextHasInterpolateExpressions(context: VisitSourceFileContext, sourceFile: ts.SourceFile): void
{
    if (context.interpolateExpressions.size > 0)
    {
        const firstResult = Array.from(context.interpolateExpressions.values())[0];

        return throwError(
            "Found a nameof.interpolate that did not exist within a " +
            `nameof.full call expression: nameof.interpolate(${getNodeText(firstResult, sourceFile)})`
        );
    }
}

/**
 * Transforms the specified {@link visitingNode `visitingNode`}.
 *
 * @param transformer
 * The component for performing the transformation.
 *
 * @param node
 * The node to transform.
 *
 * @returns
 * The result of the transformation.
 */
export function visitNode(transformer: NameofNodeTransformer<ts.Node, TransformResult>, node: ts.Node): ts.Node
{
    let result = transformer.Transform(node);
    return result ?? node;
}
