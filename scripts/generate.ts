import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import { traverseRules } from './traverse-rules.js';

const { successResultArray, failureResultArray } = await traverseRules();

if (failureResultArray.length > 0) {
  throw new Error(
    `Failed to generate rules for the following rules ${failureResultArray}`
  );
}

const generator = new RulesGenerator(successResultArray);

generator.setRulesGrouping(RulesGrouping.SCOPE);
await generator.generateRules();
generator.setRulesGrouping(RulesGrouping.CATEGORY);
await generator.generateRules();
