/**
 * Represents the location of a node.
 */
export interface INodeLocation
{
    /**
     * The path to the file containing the node.
     */
    filePath?: string;

    /**
     * The line of the node.
     */
    line?: number;

    /**
     * The column of the node.
     */
    column?: number;
}
