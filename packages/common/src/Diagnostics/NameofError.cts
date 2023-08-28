/**
 * Represents an error indicating an error in a `nameof` operation.
 */
export class NameofError extends Error
{
    /**
     * Initializes a new instance of the {@linkcode NameofError} class.
     *
     * @param name
     * The name of the error.
     *
     * @param message
     * The message of the error.
     */
    public constructor(name: string, message: string)
    {
        super(message);
        this.name = name;
    }

    /**
     * Gets the name of the error.
     */
    public get Name(): string
    {
        return this.name;
    }

    /**
     * Gets the message of the error.
     */
    public get Message(): string
    {
        return this.message;
    }
}
