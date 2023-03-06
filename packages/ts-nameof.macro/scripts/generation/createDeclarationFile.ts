import { ModuleDeclarationKind, Node, Project } from "ts-morph";

/**
 * Creates the declaration file.
 *
 * @param project
 * The project to add the declaration file to.
 */
export function createDeclarationFile(project: Project): void
{
    const globalFile = project.addSourceFileAtPath("../../lib/global.d.ts");
    const declarationFile = project.createSourceFile("ts-nameof.macro.d.ts", "", { overwrite: true });

    const namespaceDec = declarationFile.addModule(
        {
            name: '"ts-nameof.macro"',
            declarationKind: ModuleDeclarationKind.Module,
            hasDeclareKeyword: true
        });

    namespaceDec.setBodyText(globalFile.getFullText());

    for (const statement of namespaceDec.getStatements())
    {
        if (Node.isAmbientable(statement))
        {
            statement.setHasDeclareKeyword(false);
        }
    }

    namespaceDec.addExportAssignment(
        {
            expression: "nameof",
            isExportEquals: false
        });
}
