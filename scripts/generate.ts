import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import { ConfigGenerator } from './config-generator.js';
import { traverseRules } from './traverse-rules.js';

const { successResultArray, failureResultArray } = await traverseRules();

if (failureResultArray.length > 0) {
  console.error(
    `Failed to generate rules for the following rules ${JSON.stringify(failureResultArray)}`
  );
}

const rulesGenerator = new RulesGenerator(successResultArray);
const configGenerator = new ConfigGenerator(successResultArray);

[rulesGenerator, configGenerator].forEach(async (generator) => {
  generator.setRulesGrouping(RulesGrouping.SCOPE);
  await generator.generateRules();
  generator.setRulesGrouping(RulesGrouping.CATEGORY);
  await generator.generateRules();
});
