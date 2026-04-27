import fs from 'node:fs';
import path from 'node:path';
import { RulesGenerator, RulesGrouping } from './rules-generator.js';
import { ConfigGenerator } from './config-generator.js';
import { traverseRules } from './traverse-rules.js';

const scriptDirectory = new URL('.', import.meta.url).pathname;

const successResultArray = traverseRules();

const rulesGenerator = new RulesGenerator(successResultArray);
const configGenerator = new ConfigGenerator(successResultArray);

const generateFolder = path.resolve(scriptDirectory, '..', `src/generated`);

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

console.log('Rules generated successfully.');
