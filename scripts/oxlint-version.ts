import shell from 'shelljs';
import { VERSION_PREFIX } from './constants.js';
import fs from 'node:fs';

export function getLatestVersionFromClonedRepo(
  targetDirectory: string,
  versionPrefix = VERSION_PREFIX
) {
  if (!fs.existsSync(targetDirectory)) {
    return '';
  }

  shell.cd(targetDirectory);

  const oxlintTags = shell
    .exec(
      `git describe --tags  --match='${versionPrefix}*' $(git rev-list --tags)`,
      {
        silent: true,
      }
    )
    .stdout.trim()
    .split('\n');

  let latestVersion = oxlintTags[0];
  for (let index = 1; index < oxlintTags.length; index++) {
    const current = oxlintTags[index];
    const latestNumber = Number.parseInt(
      latestVersion.replace(versionPrefix, '')
    );
    const currentNumber = Number.parseInt(current.replace(versionPrefix, ''));
    if (currentNumber > latestNumber) {
      latestVersion = current;
    }
  }

  return latestVersion;
}
