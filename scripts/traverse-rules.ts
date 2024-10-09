import { promises } from 'node:fs';
import path from 'node:path';
import {
  ignoreScope,
  prefixScope,
  SPARSE_CLONE_DIRECTORY,
  TARGET_DIRECTORY,
  typescriptRulesExtendEslintRules,
} from './constants.js';

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

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await readFilesRecursively(
        entryPath,
        successResultArray,
        skippedResultArray,
        failureResultArray
      ); // Recursive call for directories
    } else if (entry.isFile() && (!containsModRs || entry.name === 'mod.rs')) {
      await processFile(
        entryPath,
        directory,
        successResultArray,
        skippedResultArray,
        failureResultArray
      ); // Process each file
    }
  }
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

  // find the correct macro block where `);` or `}` is the end of the block
  // ensure that the `);` or `}` is on its own line, with no characters before it
  const blockRegex =
    /declare_oxc_lint!\s*(\(([\S\s]*?)^\s*\)\s*;?|\s*{([\S\s]*?)^\s*}\s)/gm;

  let match = blockRegex.exec(content);

  // 'ok' way to get the scope, depends on the directory structure
  const scope = getFolderNameUnderRules(filePath);
  const shouldIgnoreRule = ignoreScope.has(scope);

  // when the file is called `mod.rs` we want to use the parent directory name as the rule name
  // Note that this is fairly brittle, as relying on the directory structure can be risky
  let effectiveRuleName = `${prefixScope(scope)}${getFileNameWithoutExtension(filePath, currentDirectory)}`;
  effectiveRuleName = effectiveRuleName.replace(/_/g, '-');

  // add the rule to the skipped array and continue to see if there's a match regardless
  if (shouldIgnoreRule) {
    skippedResultArray.push({
      value: effectiveRuleName,
      scope: scope,
      category: 'unknown',
    });

    return;
  }

  if (match === null) {
    failureResultArray.push({
      value: effectiveRuleName,
      scope: scope,
      category: 'unknown',
      error: 'No match block for `declare_oxc_lint`',
    });
  }

  while (match !== null) {
    const block = match[2] ?? match[3];

    // Remove comments to prevent them from affecting the regex
    const cleanBlock = block.replace(/\/\/.*$|\/\*[\S\s]*?\*\//gm, '').trim();

    // Extract the keyword, correctly handling optional trailing characters
    // since trailing commas are optional in Rust and the last keyword may not have one
    const keywordRegex = /,\s*(\w+)\s*,?\s*$/;
    const keywordMatch = keywordRegex.exec(cleanBlock);

    if (keywordMatch) {
      successResultArray.push({
        value: effectiveRuleName,
        scope: scope,
        category: keywordMatch[1],
      });

      if (scope === 'eslint') {
        const ruleName = effectiveRuleName.replace(/^.*\//, '');

        if (typescriptRulesExtendEslintRules.includes(ruleName)) {
          successResultArray.push({
            value: `@typescript-eslint/${ruleName}`,
            scope: 'typescript',
            category: keywordMatch[1],
          });
        }
      }
    } else {
      failureResultArray.push({
        value: effectiveRuleName,
        scope: `unknown: ${scope}`,
        category: 'unknown',
        error: 'Could not extract keyword from macro block',
      });
    }

    match = blockRegex.exec(content); // Update match for the next iteration
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

  console.log(
    `>> Parsed ${successResultArray.length} rules, skipped ${skippedResultArray.length} and encountered ${failureResultArray.length} failures\n`
  );

  return { successResultArray, skippedResultArray, failureResultArray };
}
