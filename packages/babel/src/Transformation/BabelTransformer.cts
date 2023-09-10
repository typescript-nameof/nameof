import type babel = require("@babel/core");
import { IAdapter, IErrorHandler, TransformerBase } from "@typescript-nameof/common";
import { MacroError, MacroHandler } from "babel-plugin-macros";
import { BabelAdapter } from "./BabelAdapter.cjs";
import { BabelFeatures } from "./BabelFeatures.cjs";
import { IBabelContext } from "./IBabelContext.cjs";

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
                    this.MonitorTransformation(
                        (context) =>
                        {
                            let babelContext: IBabelContext = context as IBabelContext;

                            let transformer = (path: babel.NodePath, state: babel.PluginPass): void =>
                            {
                                babelContext.state = state;
                                this.TransformNode(path, babelContext);
                            };

                            let visitor: babel.Visitor<babel.PluginPass> = {
                                exit: (path, state) =>
                                {
                                    if (path.isCallExpression() || path.isMemberExpression())
                                    {
                                        transformer(path, state);
                                        path.skip();
                                    }
                                }
                            };

                            path.traverse(
                                {
                                    ...visitor
                                },
                                state);
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
            this.MonitorTransformation(
                (context) =>
                {
                    let babelContext: IBabelContext = context as IBabelContext;
                    babelContext.state = params.state;

                    (params.references.default as Array<babel.NodePath<babel.types.Identifier>>).slice().reverse().forEach(
                        (path) =>
                        {
                            let t = this.Features.Types;
                            babelContext.nameofName = path.node.name;
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

                                if (parentPath.isMemberExpression() && grandParentPath?.type === "CallExpression")
                                {
                                    let member: string | undefined;

                                    if (t.isIdentifier(parentPath.node.property))
                                    {
                                        member = parentPath.node.property.name;
                                    }
                                    else if (t.isStringLiteral(parentPath.node.property))
                                    {
                                        member = parentPath.node.property.value;
                                    }

                                    if (member === "typed")
                                    {
                                        let grandGrandParentPath = grandParentPath.parentPath;

                                        if (grandGrandParentPath?.isMemberExpression())
                                        {
                                            return grandGrandParentPath;
                                        }
                                    }

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
