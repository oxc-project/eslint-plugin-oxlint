import { promises } from 'node:fs';
import path from 'node:path';
import {
  ignoreCategories,
  ignoreScope,
  prefixScope,
  SPARSE_CLONE_DIRECTORY,
  TARGET_DIRECTORY,
} from './constants.js';
import {
  reactHookRulesInsideReactScope,
  typescriptRulesExtendEslintRules,
  viteTestCompatibleRules,
} from '../src/constants.js';

// Recursive function to read files in a directory, this currently assumes that the directory
// structure is semi-consistent within the oxc_linter crate
export async function readFilesRecursively(
  directory: string,
  successResultArray: Rule[],
  skippedResultArray: Rule[],
  failureResultArray: Rule[]
): Promise<void> {
  const entries = await promises.readdir(directory, { withFileTypes: true });

  // Check if the current directory contains a 'mod.rs' file
  // eslint-disable-next-line unicorn/prevent-abbreviations
  const containsModRs = entries.some(
    (entry) => entry.isFile() && entry.name === 'mod.rs'
  );

  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await readFilesRecursively(
          entryPath,
          successResultArray,
          skippedResultArray,
          failureResultArray
        ); // Recursive call for directories
      } else if (
        entry.isFile() &&
        (!containsModRs || entry.name === 'mod.rs')
      ) {
        await processFile(
          entryPath,
          directory,
          successResultArray,
          skippedResultArray,
          failureResultArray
        ); // Process each file
      }
    })
  );
}

export interface Rule {
  value: string;
  scope: string;
  category: string;
  error?: string;
}

// Function to process each file and extract the desired word
async function processFile(
  filePath: string,
  currentDirectory: string,
  successResultArray: Rule[],
  skippedResultArray: Rule[],
  failureResultArray: Rule[]
): Promise<void> {
  const content = await promises.readFile(filePath, 'utf8');

  // 'ok' way to get the scope, depends on the directory structure
  let scope = getFolderNameUnderRules(filePath);
  const shouldIgnoreRule = ignoreScope.has(scope);

  // when the file is called `mod.rs` we want to use the parent directory name as the rule name
  // Note that this is fairly brittle, as relying on the directory structure can be risky
  const ruleNameWithoutScope = getFileNameWithoutExtension(
    filePath,
    currentDirectory
  ).replaceAll('_', '-');

  // All rules from `eslint-plugin-react-hooks`
  // Since oxlint supports these rules under react/*, we need to remap them.
  if (
    scope === 'react' &&
    reactHookRulesInsideReactScope.includes(ruleNameWithoutScope)
  ) {
    scope = 'react_hooks';
  }

  const effectiveRuleName =
    `${prefixScope(scope)}${ruleNameWithoutScope}`.replaceAll('_', '-');

  // add the rule to the skipped array and continue to see if there's a match regardless
  if (shouldIgnoreRule) {
    skippedResultArray.push({
      value: effectiveRuleName,
      scope: scope,
      category: 'unknown',
    });

    return;
  }

  // Remove comments to prevent them from affecting the regex
  const cleanContent = content.replaceAll(/^\s*\/\/.*$/gm, '');

  // find the correct macro block where `);` or `}` is the end of the block
  // ensure that the `);` or `}` is on its own line, with no characters before it
  const blockRegex = /declare_oxc_lint!\s*([({]([\S\s]*?)\s*[)}]\s*;?)/gm;

  const match = blockRegex.exec(cleanContent);

  if (match === null) {
    failureResultArray.push({
      value: effectiveRuleName,
      scope: scope,
      category: 'unknown',
      error: 'No match block for `declare_oxc_lint`',
    });
    return;
  }

  const block = match[2];

  // Remove comments to prevent them from affecting the regex
  const cleanBlock = block.replaceAll(/\/\/.*$|\/\*[\S\s]*?\*\//gm, '').trim();

  // Extract the keyword, skipping the optional fixability metadata,
  // and correctly handling optional trailing characters
  // since trailing commas are optional in Rust and the last keyword may not have one
  const keywordRegex = /,\s*(\w+)\s*,?\s*(?:(\w+)\s*,?\s*)?$/;
  const keywordMatch = keywordRegex.exec(cleanBlock);

  if (keywordMatch === null) {
    failureResultArray.push({
      value: effectiveRuleName,
      scope: `unknown: ${scope}`,
      category: 'unknown',
      error: 'Could not extract keyword from macro block',
    });
    return;
  }

  if (ignoreCategories.has(keywordMatch[1])) {
    skippedResultArray.push({
      value: effectiveRuleName,
      scope: scope,
      category: keywordMatch[1],
    });
    return;
  }

  successResultArray.push({
    value: effectiveRuleName,
    scope: scope,
    category: keywordMatch[1],
  });

  // special case for eslint and typescript alias rules
  if (scope === 'eslint') {
    const ruleName = effectiveRuleName.replace(/^.*\//, '');

    if (typescriptRulesExtendEslintRules.includes(ruleName)) {
      successResultArray.push({
        value: `@typescript-eslint/${ruleName}`,
        scope: 'typescript',
        category: keywordMatch[1],
      });
    }

    // special case for jest and vitest alias rules
  } else if (scope === 'jest') {
    const ruleName = effectiveRuleName.replace(/^.*\//, '');

    if (viteTestCompatibleRules.includes(ruleName)) {
      successResultArray.push({
        value: `vitest/${ruleName}`,
        scope: 'vitest',
        category: keywordMatch[1],
      });
    }
  }
}

export function getFolderNameUnderRules(filePath: string) {
  const sourceIndex = filePath.indexOf('/rules/');
  if (sourceIndex === -1) {
    return ''; // 'rules' directory not found
  }

  // Extract the substring starting after '/src/'
  const subPath = filePath.slice(Math.max(0, sourceIndex + 7));

  // Find the next '/' to isolate the folder name directly under 'src'
  const nextSlashIndex = subPath.indexOf('/');
  if (nextSlashIndex === -1) {
    return subPath; // Return the remaining path if there's no additional '/'
  }

  return subPath.slice(0, Math.max(0, nextSlashIndex));
}

export function getFileNameWithoutExtension(
  filePath: string,
  currentDirectory: string
) {
  return path.basename(filePath) === 'mod.rs'
    ? path.basename(currentDirectory)
    : path.basename(filePath, path.extname(filePath));
}

export async function traverseRules(): Promise<{
  successResultArray: Rule[];
  skippedResultArray: Rule[];
  failureResultArray: Rule[];
}> {
  const successResultArray: Rule[] = [];
  const skippedResultArray: Rule[] = [];
  const failureResultArray: Rule[] = [];

  const startDirectory = path.join(
    TARGET_DIRECTORY,
    SPARSE_CLONE_DIRECTORY,
    'rules'
  );

  await readFilesRecursively(
    startDirectory,
    successResultArray,
    skippedResultArray,
    failureResultArray
  );

  successResultArray.sort((aRule, bRule) => {
    const scopeCompare = aRule.scope.localeCompare(bRule.scope);

    if (scopeCompare !== 0) {
      return scopeCompare;
    }

    return aRule.value.localeCompare(bRule.value);
  });

  console.log(
    `>> Parsed ${successResultArray.length} rules, skipped ${skippedResultArray.length} and encountered ${failureResultArray.length} failures\n`
  );

  return { successResultArray, skippedResultArray, failureResultArray };
}
