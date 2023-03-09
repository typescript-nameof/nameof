import { throwError, throwErrorForSourceFile, transformCallExpression } from "@typescript-nameof/core";
import * as ts from "typescript";
import { getNodeText } from "./helpers";
import { parse } from "./parse";
import { transform, TransformResult } from "./transform";
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
    const visitSourceFileContext: VisitSourceFileContext = {
        interpolateExpressions: new Set()
    };

    try
    {
        const result = visitNodeAndChildren(sourceFile) as ts.SourceFile;
        throwIfContextHasInterpolateExpressions(visitSourceFileContext, sourceFile);
        return result;
    }
    catch (err: any)
    {
        return throwErrorForSourceFile(err.message, sourceFile.fileName);
    }

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
        return visitNode(node, sourceFile, visitSourceFileContext);
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
 * @param visitingNode
 * The node to transform.
 *
 * @param sourceFile
 * The source file of the node to transform.
 *
 * @returns
 * The result of the transformation.
 */
export function visitNode(visitingNode: ts.Node, sourceFile: ts.SourceFile): TransformResult;

/**
 * Transforms the specified {@link visitingNode `visitingNode`}.
 *
 * @param visitingNode
 * The node to transform.
 *
 * @param sourceFile
 * The source file of the node to transform.
 *
 * @param context
 * The context of the transformation.
 *
 * @returns
 * The result of the transformation.
 */
export function visitNode(visitingNode: ts.Node, sourceFile: ts.SourceFile, context: VisitSourceFileContext | undefined): TransformResult;

/**
 * Transforms the specified {@link visitingNode `visitingNode`}.
 *
 * @param visitingNode
 * The node to transform.
 *
 * @param sourceFile
 * The source file of the node to transform.
 *
 * @param context
 * The context of the transformation.
 *
 * @returns
 * The result of the transformation.
 */
export function visitNode(visitingNode: ts.Node, sourceFile: ts.SourceFile, context?: VisitSourceFileContext): TransformResult
{
    const parseResult = parse(visitingNode, sourceFile, context);

    if (parseResult === undefined)
    {
        return visitingNode as TransformResult;
    }

    return transform(transformCallExpression(parseResult), context);
}
