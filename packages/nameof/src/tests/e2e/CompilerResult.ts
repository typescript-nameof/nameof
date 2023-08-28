import { Diagnostic } from "typescript";

/**
 * Represents the result of a TypeScript compiler.
 */
export type CompilerResult = {
    /**
     * The reported diagnostics.
     */
    diagnostics?: Diagnostic[];

    /**
     * The code of the transformed file.
     */
    code: string;
};
