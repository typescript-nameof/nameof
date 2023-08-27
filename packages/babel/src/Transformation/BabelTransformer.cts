import type babel = require("@babel/core");
import { IAdapter, IErrorHandler, TransformerBase } from "@typescript-nameof/common";
import { MacroError, MacroHandler } from "babel-plugin-macros";
import { IBabelContext } from "./IBabelContext.cjs";
import { BabelFeatures } from "./BabelFeatures.cjs";
import { BabelAdapter } from "../BabelAdapter.cjs";

/**
 * Provides the functionality to transform babel nodes and files.
 */
export class BabelTransformer extends TransformerBase<babel.NodePath, babel.Node, IBabelContext, BabelFeatures>
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
    public constructor(babelAPI: typeof babel, errorHandler?: IErrorHandler<babel.Node, IBabelContext>)
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
                    this.MonitorInterpolations(
                        (context) =>
                        {
                            let visitor: babel.Visitor<babel.PluginPass> = {
                                CallExpression: (path, state) =>
                                {
                                    this.TransformNode(
                                        path,
                                        {
                                            ...context,
                                            state,
                                            traverseChildren: () => path.traverse(visitor, state)
                                        });
                                }
                            };

                            path.traverse(visitor, state);
                        });
                }
            }
        };
    }

    /**
     * Gets a macro for transforming `nameof` calls.
     */
    public get Macro(): MacroHandler
    {
        return (params): void =>
        {
            this.MonitorInterpolations(
                (context) =>
                {
                    (params.references.default as Array<babel.NodePath<babel.types.Identifier>>).slice().reverse().forEach(
                        (path) =>
                        {
                            let babelContext: IBabelContext = {
                                ...context,
                                state: params.state,
                                nameofIdentifierName: path.node.name
                            };

                            this.TransformNode(getPath(), babelContext);

                            /**
                             * Gets the path to the node to transform.
                             *
                             * @returns
                             * The path to the node to transform.
                             */
                            function getPath(): any
                            {
                                const parentPath = path.parentPath; // identifier;

                                if (parentPath.type === "CallExpression")
                                {
                                    return parentPath;
                                }

                                const grandParentPath = parentPath.parentPath;

                                if (parentPath.type === "MemberExpression" && grandParentPath?.type === "CallExpression")
                                {
                                    return grandParentPath;
                                }

                                throw new MacroError(`[ts-nameof]: Could not find a call expression at path: ${grandParentPath?.getSource()}`);
                            }
                        });
                });
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
    public TransformNode(path: babel.NodePath, context: IBabelContext): void
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
    protected InitializeAdapter(): IAdapter<babel.NodePath, babel.types.Node, IBabelContext>
    {
        return new BabelAdapter(this.Features);
    }
}
