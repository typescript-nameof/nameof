import { Project } from "ts-morph";

/**
 * Creates a new project.
 *
 * @returns
 * The newly created project.
 */
export function getProject(): Project
{
    return new Project({ tsConfigFilePath: "tsconfig.json", compilerOptions: { declaration: true } });
}
