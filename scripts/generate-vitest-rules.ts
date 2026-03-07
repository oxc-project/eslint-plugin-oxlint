import fs from 'node:fs';
import path from 'node:path';
import packageJson from '../package.json' with { type: 'json' };

// --- Generate the vitest rules file ---

const __dirname = new URL('.', import.meta.url).pathname;
// `<repo>/scripts/generated/`
const scriptsGenerateFolder = path.resolve(__dirname, `generated`);

if (!fs.existsSync(scriptsGenerateFolder)) {
  fs.mkdirSync(scriptsGenerateFolder);
}

// Generate the vitest-compatible-jest-rules.json file by pulling it from the oxc repository.
// This keeps the two in sync.
// Use the version of the package to determine which git reference to pull from.
const gitReference = `oxlint_v${packageJson.version}`;

const githubURL = `https://raw.githubusercontent.com/oxc-project/oxc/${gitReference}/crates/oxc_linter/data/vitest_compatible_jest_rules.json`;
const response = await fetch(githubURL);

if (!response.ok) {
  throw new Error(
    `Failed to fetch vitest-compatible-jest-rules.json: ${response.status} ${response.statusText}`
  );
}

const vitestRules = await response.text();
const vitestRulesPath = path.resolve(scriptsGenerateFolder, 'vitest-compatible-jest-rules.json');
fs.writeFileSync(vitestRulesPath, vitestRules, 'utf8');

console.log('vitest-compatible-jest-rules.json copied successfully from the oxc repo.');
