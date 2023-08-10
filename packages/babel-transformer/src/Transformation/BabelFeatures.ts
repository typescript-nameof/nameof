import type babelAPI = require("@babel/core");
import { TransformerFeatures } from "@typescript-nameof/common";
import { ITransformTarget } from "../ITransformTarget";

/**
 * @inheritdoc
 */
export abstract class BabelFeatures extends TransformerFeatures<ITransformTarget>
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
     */
    public constructor(babel: typeof babelAPI)
    {
        super();
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
