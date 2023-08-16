import type babel = require("@babel/core");
import { IErrorHandler, NameofNodeTransformer, throwErrorForSourceFile, TransformerBase } from "@typescript-nameof/common";
import { BabelFeatures } from "./BabelFeatures";
import { BabelAdapter } from "../BabelAdapter";
import { ITransformTarget } from "../ITransformTarget";
import { ParseOptions } from "../parse";

/**
 * Provides the functionality to transform babel nodes and files.
 */
export class BabelTransformer extends TransformerBase<babel.Node, Record<string, never>, BabelFeatures>
{
    /**
     * A component for transforming `babel` nodes.
     */
    private transformer: NameofNodeTransformer<ITransformTarget, babel.Node>;

    /**
     * Initializes a new instance of the {@linkcode BabelTransformer} class.
     *
     * @param babelAPI
     * An instance of babel.
     *
     * @param errorHandler
     * A component for handling errors.
     */
    public constructor(babelAPI: typeof babel, errorHandler?: IErrorHandler<babel.Node>)
    {
        super(new BabelFeatures(babelAPI, errorHandler));
        this.transformer = new NameofNodeTransformer(new BabelAdapter(this.Features));
    }

    /**
     * Gets a plugin for the use with `babel`.
     */
    public get Plugin(): babel.PluginObj
    {
        let visitor: babel.Visitor<babel.PluginPass> = {
            CallExpression: (path, state) =>
            {
                let filePath = state.file.opts.filename as string;

                try
                {
                    this.TransformNode(
                        path,
                        {
                            traverseChildren: () => path.traverse(visitor, state)
                        });
                }
                catch (error)
                {
                    let message: string;

                    if (error instanceof Error)
                    {
                        message = error.message;
                    }
                    else
                    {
                        message = `${error}`;
                    }

                    throwErrorForSourceFile(message, filePath);
                }
            }
        };

        return { visitor };
    }

    /**
     * Gets a component for transforming `babel` nodes.
     */
    protected get Transformer(): NameofNodeTransformer<ITransformTarget, babel.Node, Record<string, unknown>>
    {
        return this.transformer;
    }

    /**
     * Transforms the node located at the specified {@linkcode path}.
     *
     * @param path
     * The path to the node to transform.
     *
     * @param options
     * An object containing options for the transformation.
     */
    public TransformNode(path: babel.NodePath, options: ParseOptions): void
    {
        let transformed = this.Transformer.Transform(
            {
                path,
                options
            },
            {});

        if (transformed)
        {
            path.replaceWith(transformed);
        }
    }
}
