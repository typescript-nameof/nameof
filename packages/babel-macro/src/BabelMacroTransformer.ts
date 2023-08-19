import type babel = require("@babel/core");
import { BabelTransformer } from "@typescript-nameof/babel-plugin";
import { BabelContext } from "@typescript-nameof/babel-plugin/src/Transformation/BabelContext";
import { IErrorHandler } from "@typescript-nameof/common";
import { MacroError, MacroHandler } from "babel-plugin-macros";

/**
 * Provides the functionality to transform files using a babel-macro.
 */
export class BabelMacroTransformer extends BabelTransformer
{
    /**
     * Initializes a new instance of the {@linkcode BabelMacroTransformer} class.
     *
     * @param babelAPI
     * An instance of babel.
     *
     * @param errorHandler
     * A component for handling errors.
     */
    public constructor(babelAPI: typeof babel, errorHandler?: IErrorHandler<babel.Node, BabelContext>)
    {
        super(babelAPI, errorHandler);
    }

    /**
     * Gets a babel-macro for transforming `nameof` calls.
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
                            let babelContext: BabelContext = {
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
}
