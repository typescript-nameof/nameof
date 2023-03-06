import { createStringLiteralNode, createTemplateExpressionNode } from "./nodeFactories";
import { InterpolateNode, StringLiteralNode, TemplateExpressionNode } from "./nodes";

/**
 * Provides the functionality to build string and template expressions.
 */
export class StringOrTemplateExpressionNodeBuilder
{
    /**
     * The text of the expression.
     */
    private text: string | undefined = "";

    /**
     * The parts of the template expression.
     */
    private items: Array<string | InterpolateNode> = [];

    /**
     * Checks whether the expression currently contains text.
     *
     * @returns
     * A value indicating whether the expression currently contains text.
     */
    public hasText(): boolean
    {
        return this.text !== undefined && this.text.length > 0 || this.items.length > 0;
    }

    /**
     * Builds a node containing the current text.
     *
     * @returns
     * The newly created node.
     */
    public buildNode(): StringLiteralNode | TemplateExpressionNode
    {
        if (this.text !== undefined)
        {
            return createStringLiteralNode(this.text);
        }

        return createTemplateExpressionNode(this.items);
    }

    /**
     * Adds the specified {@link item `item`} to the current text.
     *
     * @param item
     * The item to add to the text.
     */
    public addItem(item: string | InterpolateNode | StringLiteralNode | TemplateExpressionNode): void
    {
        if (typeof item === "string")
        {
            this.addText(item);
        }
        else if (item.kind === "StringLiteral")
        {
            this.addText(item.value);
        }
        else if (item.kind === "TemplateExpression")
        {
            for (const part of item.parts)
            {
                this.addItem(part);
            }
        }
        else
        {
            this.addInterpolate(item);
        }
    }

    /**
     * Adds the specified {@link newText `newText`} to the expression.
     *
     * @param newText
     * The text to add.
     */
    public addText(newText: string): void
    {
        if (this.text === undefined)
        {
            let tail = this.items[this.items.length - 1];

            if (typeof tail === "string")
            {
                this.items[this.items.length - 1] = tail + newText;
            }
            else
            {
                this.items.push(newText);
            }
        }
        else
        {
            this.text += newText;
        }
    }

    /**
     * Adds an interpolate call to the expression.
     *
     * @param interpolate
     * The interpolate call to add.
     */
    private addInterpolate(interpolate: InterpolateNode): void
    {
        if (this.text !== undefined)
        {
            this.items.push(this.text);
            this.text = undefined;
        }

        this.items.push(interpolate);
    }
}
