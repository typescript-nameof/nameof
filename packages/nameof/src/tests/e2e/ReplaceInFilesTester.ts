import { TempFile } from "@manuth/temp-files";
import { IErrorHandler } from "@typescript-nameof/common";
import { INameofOutput, TransformerTester } from "@typescript-nameof/test";
import fs from "fs-extra";
import { replaceInFiles } from "../../text/replaceInFiles.cjs";

const { readFile, writeFile } = fs;

/**
 * Provides the functionality to test the {@linkcode replaceIn}
 */
export class ReplaceInFilesTester extends TransformerTester<any, any>
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return `${replaceInFiles.name}()`;
    }

    /**
     * @inheritdoc
     */
    protected override get Timeout(): number
    {
        return 5 * 1000;
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input of the transformation.
     *
     * @param result
     * The output of the transformation.
     */
    protected override HasError(input: string, result: INameofOutput): Promise<void>
    {
        return super.HasError(input, result);
    }

    /**
     * @inheritdoc
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected override async Run(code: string, errorHandler?: IErrorHandler<any, any> | undefined): Promise<string>
    {
        let tempFile = new TempFile();
        await writeFile(tempFile.FullName, code);

        try
        {
            await replaceInFiles([tempFile.FullName]);
            return (await readFile(tempFile.FullName)).toString();
        }
        catch (error)
        {
            errorHandler?.Report({}, {}, {}, new Error(`${error}`));
            throw error;
        }
    }
}
