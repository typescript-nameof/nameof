import type babel = require("@babel/core");
import { IErrorHandler, ITransformationContext, throwErrorForSourceFile, TransformerBase } from "@typescript-nameof/common";
import { BabelContext } from "./BabelContext";
import { BabelFeatures } from "./BabelFeatures";
import { BabelAdapter } from "../BabelAdapter";

/**
 * Provides the functionality to transform babel nodes and files.
 */
export class BabelTransformer extends TransformerBase<babel.Node, BabelContext, BabelFeatures>
{
    /**
     * A component for transforming `babel` nodes.
     */
    private transformer: BabelAdapter;

    /**
     * Initializes a new instance of the {@linkcode BabelTransformer} class.
     *
     * @param babelAPI
     * An instance of babel.
     *
     * @param errorHandler
     * A component for handling errors.
     */
    public constructor(babelAPI: typeof babel, errorHandler?: IErrorHandler<babel.Node, BabelContext>)
    {
        super(new BabelFeatures(babelAPI, errorHandler));
        this.transformer = new BabelAdapter(this.Features);
    }

    /**
     * Gets a plugin for the use with `babel`.
     */
    public get Plugin(): babel.PluginObj
    {
        let context: ITransformationContext<babel.Node> = {
            interpolationCalls: []
        };

        let visitor: babel.Visitor<babel.PluginPass> = {
            CallExpression: (path, state) =>
            {
                let filePath = state.file.opts.filename as string;

                try
                {
                    this.TransformNode(
                        path,
                        {
                            ...context,
                            state,
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
    protected get Transformer(): BabelAdapter
    {
        return this.transformer;
    }

    /**
     * Transforms the node located at the specified {@linkcode path}.
     *
     * @param path
     * The path to the node to transform.
     *
     * @param context
     * The context of the operation.
     */
    public TransformNode(path: babel.NodePath, context: BabelContext): void
    {
        let transformed = this.Transformer.Transform(
            {
                path,
                options: context
            },
            context);

        if (transformed)
        {
            path.replaceWith(transformed);
        }
    }
}
