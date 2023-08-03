import { INameOfProvider } from "@typescript-nameof/common";

declare global
{
    /**
     * A component for parsing the names of identifiers and expressions.
     */
    const nameof: INameOfProvider;
}

export {};
