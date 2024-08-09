import { writeFileSync } from 'node:fs';
import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import { traverseRules } from './traverse-rules.js';
import { getLatestVersionFromClonedRepo } from './oxlint-version.js';
import { TARGET_DIRECTORY, VERSION_PREFIX } from './constants.js';
import packageJson from '../package.json' with { type: 'json' };

const { successResultArray, failureResultArray } = await traverseRules();

if (failureResultArray.length > 0) {
  console.error(
    `Failed to generate rules for the following rules ${JSON.stringify(failureResultArray)}`
  );
}

const oxlintVersion = getLatestVersionFromClonedRepo(
  TARGET_DIRECTORY,
  VERSION_PREFIX
);

if (!oxlintVersion) {
  throw new Error(
    'Failed to get the latest version of oxlint, did you forget to run `pnpm clone`?'
  );
}

const generator = new RulesGenerator(oxlintVersion, successResultArray);

generator.setRulesGrouping(RulesGrouping.SCOPE);
await generator.generateRules();
generator.setRulesGrouping(RulesGrouping.CATEGORY);
await generator.generateRules();

// Update package.json version
writeFileSync(
  '../package.json',
  JSON.stringify({
    ...packageJson,
    version: oxlintVersion.replace(VERSION_PREFIX, '').split('-')[0],
  })
);
