import { ModuleDeclarationKind, Project } from "ts-morph";

/**
 * Creates the declaration file.
 *
 * @param project
 * The project to add the declaration file to.
 */
export function createDeclarationFile(project: Project): void
{
    const mainFile = project.getSourceFileOrThrow("src/main.ts");
    const outputFiles = mainFile.getEmitOutput({ emitOnlyDtsFiles: true }).getOutputFiles();

    if (outputFiles.length !== 1)
    {
        throw new Error(`Expected 1 file when emitting, but had ${outputFiles.length}`);
    }

    const declarationFile = project.createSourceFile("ts-nameof.d.ts", outputFiles[0].getText(), { overwrite: true });

    removePreceedingCommentReference();
    commentExternalTypes();
    removeTypeScriptImport();
    wrapInGlobalModule();
    addGlobalDeclarations();

    /**
     * Removes preceding comments.
     */
    function removePreceedingCommentReference(): void
    {
        const firstChild = declarationFile.getFirstChildOrThrow();
        declarationFile.removeText(0, firstChild.getStart());
    }

    /**
     * Comments out external types.
     */
    function commentExternalTypes(): void
    {
        // these types are made to be any so that this library will work when included in
        // web projects and NodeJS does not exist. See issue #22.
        const typesToComment = [
            "ts.Program",
            "ts.TransformerFactory<ts.SourceFile>",
            "NodeJS.ErrnoException"
        ];

        declarationFile.forEachDescendant(
            descendant =>
            {
                if (typesToComment.includes(descendant.getText()))
                {
                    descendant.replaceWithText(`any /* ${descendant.getText()} */`);
                }
            });
    }

    /**
     * Removes the `typescript` import.
     */
    function removeTypeScriptImport(): void
    {
        declarationFile.getImportDeclarationOrThrow("typescript").remove();
    }

    /**
     * Wraps the whole content in a global module.
     */
    function wrapInGlobalModule(): void
    {
        const fileText = declarationFile.getText();
        declarationFile.removeText();

        const apiModule = declarationFile.addModule(
            {
                hasDeclareKeyword: true,
                declarationKind: ModuleDeclarationKind.Module,
                name: '"ts-nameof"'
            });

        apiModule.setBodyText(fileText);

        apiModule.getVariableStatementOrThrow(
            s => s.getDeclarations().some(
                d => d.getName() === "api")).setHasDeclareKeyword(false);
    }

    /**
     * Adds the global declarations.
     */
    function addGlobalDeclarations(): void
    {
        const globalFile = project.addSourceFileAtPath("../../lib/global.d.ts");

        declarationFile.addStatements(
            writer =>
            {
                writer.newLine();
                writer.write(globalFile.getText().replace(/\r?\n$/, ""));
            });
    }
}
