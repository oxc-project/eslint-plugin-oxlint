import shell from "shelljs";
import { VERSION_PREFIX } from "./constants.js";
import fs from "node:fs";

export function getLatestVersionFromClonedRepo(
  targetDirectory: string,
  versionPrefix = VERSION_PREFIX,
) {
  if (!fs.existsSync(targetDirectory)) {
    return "";
  }

  shell.cd(targetDirectory);

  const oxlintTags = shell
    .exec(
      `git describe --tags  --match='${versionPrefix}*' $(git rev-list --tags)`,
      {
        silent: true,
      },
    )
    .stdout.trim()
    .split("\n");

  const latestVersion = oxlintTags
    .slice(1)
    .reduce((latest: string, current: string) => {
      const latestNumber = Number.parseInt(latest.replace(versionPrefix, ""));
      const currentNumber = Number.parseInt(current.replace(versionPrefix, ""));
      return currentNumber > latestNumber ? current : latest;
    }, oxlintTags[0]);

  return latestVersion;
}
