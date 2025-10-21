import { INameOfProvider } from "@typescript-nameof/common-types";

declare global
{
    /**
     * A component for parsing the names of identifiers and expressions.
     */
    const nameof: INameOfProvider;
}

export {};
