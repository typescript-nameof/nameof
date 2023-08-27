import type babelAPI = require("@babel/core");
import { IErrorHandler, TransformerFeatures } from "@typescript-nameof/common";
import { IBabelContext } from "./IBabelContext.cjs";

/**
 * @inheritdoc
 */
export class BabelFeatures extends TransformerFeatures<babelAPI.Node, IBabelContext>
{
    /**
     * An instance of the babel compiler.
     */
    private babel: typeof babelAPI;

    /**
     * Initializes a new instance of the {@linkcode BabelFeatures} class.
     *
     * @param babel
     * An instance of the babel compiler.
     *
     * @param errorHandler
     * A component for handling errors.
     */
    public constructor(babel: typeof babelAPI, errorHandler?: IErrorHandler<babelAPI.Node, IBabelContext>)
    {
        super(errorHandler);
        this.babel = babel;
    }

    /**
     * Gets an instance of the babel compiler.
     */
    public get Babel(): typeof babelAPI
    {
        return this.babel;
    }

    /**
     * Gets a component for handling babel types.
     */
    public get Types(): typeof babelAPI.types
    {
        return this.Babel.types;
    }
}
