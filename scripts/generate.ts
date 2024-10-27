import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import { ConfigGenerator } from './config-generator.js';
import { traverseRules } from './traverse-rules.js';
import { getLatestVersionFromClonedRepo } from './oxlint-version.js';
import { TARGET_DIRECTORY, VERSION_PREFIX } from './constants.js';

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

const rulesGenerator = new RulesGenerator(oxlintVersion, successResultArray);
const configGenerator = new ConfigGenerator(oxlintVersion, successResultArray);

[rulesGenerator, configGenerator].forEach(async (generator) => {
  generator.setRulesGrouping(RulesGrouping.SCOPE);
  await generator.generateRules();
  generator.setRulesGrouping(RulesGrouping.CATEGORY);
  await generator.generateRules();
});
