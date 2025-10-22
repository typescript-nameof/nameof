import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { Dictionary, Package } from "@manuth/package-json-editor";
import fs, { pathExists } from "fs-extra";
import GitBranch from "git-branch";
import { globby } from "globby";
import npmWhich from "npm-which";

const { writeJSON } = fs;

/**
 * Represents a dependency candidate.
 */
interface ICandidateDescriptor
{
    /**
     * The name of the dependency.
     */
    Name: string;

    /**
     * The argument to pass to `npm install` for installing the dependency.
     */
    ScopeArgument: string;
}

(
    async () =>
    {
        let releaseBranchPattern = /^release\/(.*)/;
        let npmPath = npmWhich(import.meta.dirname).sync("npm");
        let branchName = await GitBranch(import.meta.dirname);
        let releaseName = branchName.replace(releaseBranchPattern, "$1");
        let npmPackage = new Package(join(import.meta.dirname, "..", Package.FileName));

        if (
            releaseBranchPattern.test(branchName) &&
            releaseName.length > 0)
        {
            let packageResolvers: Array<() => Package> = [];
            let updateQueue = new Dictionary<Package, ICandidateDescriptor[]>();
            process.chdir(dirname(npmPackage.FileName));

            if (npmPackage.AdditionalProperties.Has("workspaces"))
            {
                let workspacePatterns: string[];
                let workspaceSetting = npmPackage.AdditionalProperties.Get("workspaces");

                if (Array.isArray(workspaceSetting))
                {
                    workspacePatterns = workspaceSetting;
                }
                else
                {
                    workspacePatterns = [...(workspaceSetting as any)?.packages ?? []];
                }

                for (let pattern of workspacePatterns)
                {
                    for (let workspacePath of await globby(pattern, { onlyDirectories: true }))
                    {
                        let packageFileName: string;
                        workspacePath = join(dirname(npmPackage.FileName), workspacePath);
                        packageFileName = join(workspacePath, Package.FileName);

                        if (await pathExists(packageFileName))
                        {
                            packageResolvers.push(() => new Package(packageFileName));
                        }
                    }
                }
            }

            spawnSync(
                npmPath,
                [
                    "version",
                    ...(packageResolvers.length > 0 ? ["--workspaces"] : []),
                    "--no-git-tag-version",
                    releaseName,
                    "--allow-same-version"
                ]);

            for (let packageResolver of packageResolvers)
            {
                updateQueue.Add(packageResolver(), []);
            }

            for (let workspacePackage of updateQueue.Keys)
            {
                for (let dependencyCandidate of updateQueue.Keys)
                {
                    for (let entry of [
                        [workspacePackage.Dependencies, "--save"],
                        [workspacePackage.DevelopmentDependencies, "--save-dev"],
                        [workspacePackage.OptionalDependencies, "--save-optional"],
                        [workspacePackage.PeerDependencies, "--save-peer"]
                    ] as Array<[Dictionary<string, string>, string]>)
                    {
                        if (entry[0].Has(dependencyCandidate.Name as string))
                        {
                            entry[0].Remove(dependencyCandidate.Name as string);

                            await writeJSON(
                                workspacePackage.FileName,
                                workspacePackage.ToJSON(),
                                {
                                    spaces: 2
                                });

                            updateQueue.Get(workspacePackage).push(
                                {
                                    Name: dependencyCandidate.Name as string,
                                    ScopeArgument: entry[1]
                                });
                        }
                    }
                }
            }

            spawnSync(
                npmPath,
                [
                    "install",
                    "--ignore-scripts",
                    "--no-audit"
                ]);

            for (let workspacePackage of updateQueue.Keys)
            {
                for (let dependency of updateQueue.Get(workspacePackage))
                {
                    spawnSync(
                        npmPath,
                        [
                            "install",
                            "--ignore-scripts",
                            "--no-audit",
                            "--workspace",
                            workspacePackage.Name as string,
                            dependency.ScopeArgument,
                            dependency.Name
                        ]);
                }

                await writeJSON(workspacePackage.FileName, new Package(workspacePackage.FileName).ToJSON(), { spaces: 2 });
            }

            spawnSync(
                npmWhich(import.meta.dirname).sync("git"),
                [
                    "commit",
                    "-a",
                    "-m",
                    `Bump the version number to ${releaseName}`
                ]);
        }
        else
        {
            console.error(`This method is not allowed on the current branch \`${branchName}\``);
        }
    })();
