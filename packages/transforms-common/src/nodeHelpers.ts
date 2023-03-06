import { Node } from "./nodes";

/**
 * Gets the nodes inside the chain of the specified {@link node `node`}.
 *
 * @param node
 * The node to get the chain from.
 *
 * @returns
 * The nodes inside the chain of the specified {@link node `node`}.
 */
export function flattenNodeToArray(node: Node): Node[]
{
    const flattenedNodes: Node[] = [node];

    while (node.next !== undefined)
    {
        flattenedNodes.push(node.next);
        node = node.next;
    }

    return flattenedNodes;
}

/**
 * Gets the last node inside the chain of the specified {@link node `node`}.
 *
 * @param node
 * The node to get the last item from.
 *
 * @returns
 * The last node inside the chain of the specified {@link node `node`}.
 */
export function getLastNextNode(node: Node): Node
{
    while (node.next !== undefined)
    {
        node = node.next;
    }

    return node;
}
