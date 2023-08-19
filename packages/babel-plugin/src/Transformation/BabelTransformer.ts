import type babel = require("@babel/core");
import { IAdapter, IErrorHandler, throwErrorForSourceFile, TransformerBase } from "@typescript-nameof/common";
import { BabelContext } from "./BabelContext";
import { BabelFeatures } from "./BabelFeatures";
import { BabelAdapter } from "../BabelAdapter";

/**
 * Provides the functionality to transform babel nodes and files.
 */
export class BabelTransformer extends TransformerBase<babel.NodePath, babel.Node, BabelContext, BabelFeatures>
{
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
    }

    /**
     * Gets a plugin for the use with `babel`.
     */
    public get Plugin(): babel.PluginObj
    {
        return {
            visitor: {
                Program: (path, state) =>
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

                    this.MonitorInterpolations(
                        () =>
                        {
                            path.traverse(visitor, state);
                        });
                }
            }
        };
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
        let transformed = this.Adapter.Transform(path, context);

        if (transformed)
        {
            path.replaceWith(transformed);
        }
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The newly created adapter.
     */
    protected InitializeAdapter(): IAdapter<babel.NodePath, babel.types.Node, BabelContext>
    {
        return new BabelAdapter(this.Features);
    }
}
