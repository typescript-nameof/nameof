import * as ts from "typescript";
import { TypeScriptTransformer } from "../Transformation/TypeScriptTransformer.cjs";

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
 * Transforms the specified {@linkcode text}.
 *
 * @param text
 * The text to transform.
 */
export function replaceInText(text: string): ISubstitutionResult;

/**
 * Transforms the file with the specified {@linkcode fileName}.
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
export function replaceInText(fileName: string, fileText: string): ISubstitutionResult;

/**
 * Transforms the file with the specified {@linkcode fileName}.
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
export function replaceInText(fileName: string, fileText?: string): ISubstitutionResult
{
    // unofficial pre-2.0 backwards compatibility for this method
    if (!fileText)
    {
        fileText = fileName;
        fileName = "/file.tsx"; // assume tsx
    }

    let sourceFile = ts.createSourceFile(fileName, fileText, ts.ScriptTarget.Latest, false);
    let transformations: ITransformation[] = [];
    let transformer = new TypeScriptTransformer();

    ts.transform(
        sourceFile,
        [
            transformer.GetFactory(
                {
                    postTransformHook:
                        (oldNode, newNode) =>
                        {
                            if (oldNode !== newNode)
                            {
                                let nodeStart = oldNode.getStart(sourceFile);
                                let lastTransformation = transformations[transformations.length - 1];

                                // remove the last transformation if it's nested within this transformation
                                if (lastTransformation !== undefined && lastTransformation.start > nodeStart)
                                {
                                    transformations.pop();
                                }

                                transformations.push(
                                    {
                                        start: nodeStart,
                                        end: oldNode.end,
                                        text: printer.printNode(ts.EmitHint.Unspecified, newNode, sourceFile)
                                    });
                            }
                        }
                }
            )
        ]);

    if (transformations.length === 0)
    {
        return { replaced: false };
    }
    else
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
        return { fileText: finalText, replaced: true };
    }
}
