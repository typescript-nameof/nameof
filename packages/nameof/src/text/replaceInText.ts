import * as ts from "typescript";
import { ITypeScriptContext } from "../Transformation/ITypeScriptContext";
import { throwIfContextHasInterpolateExpressions, visitNode } from "../Transformation/transformerFactory";
import { TypeScriptAdapter } from "../Transformation/TypeScriptAdapter";
import { TypeScriptFeatures } from "../Transformation/TypeScriptFeatures";

const printer = ts.createPrinter();

/**
 * Represents the result of a substitution.
 */
interface ISubstitutionResult
{
    /**
     * The resulting text of the file.
     */
    fileText?: string;

    /**
     * A value indicating whether a substitution has been performed.
     */
    replaced: boolean;
}

/**
 * Represents a transformation.
 */
interface ITransformation
{
    /**
     * The start offset of the text to replace.
     */
    start: number;

    /**
     * The end offset of the text to replace.
     */
    end: number;

    /**
     * The replacement of the transformation.
     */
    text: string;
}

/**
 * Transforms the file with the specified {@link fileName `fileName`}.
 *
 * @param fileName
 * The name of the file to transform.
 *
 * @param fileText
 * The text of the file to transform.
 *
 * @returns
 * The result of the substitution.
 */
export function replaceInText(fileName: string, fileText: string): ISubstitutionResult
{
    // unofficial pre-2.0 backwards compatibility for this method
    if (arguments.length === 1)
    {
        fileText = fileName;
        fileName = "/file.tsx"; // assume tsx
    }

    const sourceFile = ts.createSourceFile(fileName, fileText, ts.ScriptTarget.Latest, false);
    const transformations: ITransformation[] = [];

    let transformerContext: ITypeScriptContext = {
        file: sourceFile
    };

    const transformerFactory: ts.TransformerFactory<ts.SourceFile> = context =>
    {
        // this will always use the source file above
        return _ => visitSourceFile(context);
    };

    let adapter = new TypeScriptAdapter(new TypeScriptFeatures());
    ts.transform(sourceFile, [transformerFactory]);
    throwIfContextHasInterpolateExpressions(adapter.Context, sourceFile);

    if (transformations.length === 0)
    {
        return { replaced: false };
    }

    return { fileText: getTransformedText(), replaced: true };

    /**
     * Performs the transformation.
     *
     * @returns
     * The transformed text.
     */
    function getTransformedText(): string
    {
        let finalText = "";
        let lastPos = 0;

        for (const transform of transformations)
        {
            finalText += fileText.substring(lastPos, transform.start);
            finalText += transform.text;
            lastPos = transform.end;
        }

        finalText += fileText.substring(lastPos);
        return finalText;
    }

    /**
     * Transforms the {@link sourceFile `sourceFile`}.
     *
     * @param context
     * The context of the transformation.
     *
     * @returns
     * The transformed source file.
     */
    function visitSourceFile(context: ts.TransformationContext): ts.SourceFile
    {
        return visitNodeAndChildren(sourceFile) as ts.SourceFile;

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

            node = ts.visitEachChild(node, childNode => visitNodeAndChildren(childNode), context);

            const resultNode = visitNode(adapter, node, transformerContext);
            const wasTransformed = resultNode !== node;

            if (wasTransformed)
            {
                storeTransformation();
            }

            return resultNode;

            /**
             * Stores the transformation.
             */
            function storeTransformation(): void
            {
                const nodeStart = node.getStart(sourceFile);
                const lastTransformation = transformations[transformations.length - 1];

                // remove the last transformation if it's nested within this transformation
                if (lastTransformation !== undefined && lastTransformation.start > nodeStart)
                {
                    transformations.pop();
                }

                transformations.push(
                    {
                        start: nodeStart,
                        end: node.end,
                        text: printer.printNode(ts.EmitHint.Unspecified, resultNode, sourceFile)
                    });
            }
        }
    }
}
