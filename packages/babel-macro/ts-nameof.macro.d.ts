declare module "@typescript-nameof/babel-macro" {
    import { INameOfProvider } from "@typescript-nameof/core";

    /**
     * A component for parsing the names of identifiers and expressions.
     */
    const nameof: INameOfProvider;
    export default nameof;
}
