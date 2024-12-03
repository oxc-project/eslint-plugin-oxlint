import fs from 'node:fs';
import path from 'node:path';
import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import { ConfigGenerator } from './config-generator.js';
import { traverseRules } from './traverse-rules.js';

const __dirname = new URL('.', import.meta.url).pathname;

const { successResultArray, failureResultArray } = await traverseRules();

if (failureResultArray.length > 0) {
  console.error(
    `Failed to generate rules for the following rules ${JSON.stringify(failureResultArray)}`
  );
}

const rulesGenerator = new RulesGenerator(successResultArray);
const configGenerator = new ConfigGenerator(successResultArray);

const generateFolder = path.resolve(__dirname, '..', `src/generated`);

if (!fs.existsSync(generateFolder)) {
  fs.mkdirSync(generateFolder);
}

const promises = [rulesGenerator, configGenerator].map(async (generator) => {
  generator.setRulesGrouping(RulesGrouping.SCOPE);
  await generator.generateRules(generateFolder);
  generator.setRulesGrouping(RulesGrouping.CATEGORY);
  await generator.generateRules(generateFolder);
});

await Promise.all(promises);
