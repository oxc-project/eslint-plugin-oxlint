import fs from "node:fs";
import path from "node:path";
import {
  ignoreScope,
  prefixScope,
  SPARSE_CLONE_DIRECTORY,
  TARGET_DIRECTORY,
} from "./constants.js";

interface ResultMap {
  [key: string]: string[];
}

// Recursive function to read files in a directory, this currently assumes that the directory
// structure is semi-consistent within the oxc_linter crate
export async function readFilesRecursively(
  directory: string,
  successResultMap: ResultMap,
  failureResultMap: ResultMap,
): Promise<void> {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await readFilesRecursively(entryPath, successResultMap, failureResultMap); // Recursive call for directories
    } else if (entry.isFile()) {
      await processFile(
        entryPath,
        directory,
        successResultMap,
        failureResultMap,
      ); // Process each file
    }
  }
}

// Function to process each file and extract the desired word
async function processFile(
  filePath: string,
  currentDirectory: string,
  successResultMap: ResultMap,
  failureResultMap: ResultMap,
): Promise<void> {
  const content = await fs.promises.readFile(filePath, "utf8");

  // find the correct macro block where `);' is the end of the block
  // ensure that the `);` is on its own line, with no characters before it
  const blockRegex = /declare_oxc_lint!\(([\S\s]*?)^\s*\);/gm;
  let match = blockRegex.exec(content);
  while (match !== null) {
    const block = match[1];

    // Remove comments to prevent them from affecting the regex
    const cleanBlock = block.replace(/\/\/.*$|\/\*[\S\s]*?\*\//gm, "").trim();

    // Extract the keyword, correctly handling optional trailing characters
    // since trailing commas are optional in Rust and the last keyword may not have one
    const keywordRegex = /,\s*(\w+)\s*,?\s*$/;
    const keywordMatch = keywordRegex.exec(cleanBlock);

    // 'ok' way to get the scope, depends on the directory structure
    const scope = getFolderNameUnderRules(filePath);

    if (ignoreScope.has(scope)) {
      break;
    }

    // when the file is called `mod.rs` we want to use the parent directory name as the rule name
    // Note that this is fairly brittle, as relying on the directory structure can be risky
    let effectiveRuleName = `${prefixScope(scope)}${getFileNameWithoutExtension(filePath, currentDirectory)}`;
    effectiveRuleName = effectiveRuleName.replaceAll("_", "-");

    if (keywordMatch) {
      const word = keywordMatch[1]; // Capture the last keyword, trimming any spaces
      if (!successResultMap[word]) {
        successResultMap[word] = [];
      }

      // Add the file path to the array for the found word
      successResultMap[word].push(effectiveRuleName);
    } else {
      if (!failureResultMap.unknown) {
        failureResultMap.unknown = [];
      }
      failureResultMap.unknown.push(effectiveRuleName);
    }

    match = blockRegex.exec(content); // Update match for the next iteration
  }
}

export function getFolderNameUnderRules(filePath: string) {
  const sourceIndex = filePath.indexOf("/rules/");
  if (sourceIndex === -1) {
    return ""; // 'rules' directory not found
  }

  // Extract the substring starting after '/src/'
  const subPath = filePath.substring(sourceIndex + 7);

  // Find the next '/' to isolate the folder name directly under 'src'
  const nextSlashIndex = subPath.indexOf("/");
  if (nextSlashIndex === -1) {
    return subPath; // Return the remaining path if there's no additional '/'
  }

  return subPath.substring(0, nextSlashIndex);
}

export function getFileNameWithoutExtension(
  filePath: string,
  currentDirectory: string,
) {
  return path.basename(filePath) === "mod.rs"
    ? path.basename(currentDirectory)
    : path.basename(filePath, path.extname(filePath));
}

export async function traverseRules() {
  const successResultMap: ResultMap = {};
  const failureResultMap: ResultMap = {};
  const startDirectory = path.join(
    TARGET_DIRECTORY,
    SPARSE_CLONE_DIRECTORY,
    "rules",
  );

  await readFilesRecursively(
    startDirectory,
    successResultMap,
    failureResultMap,
  );

  console.log("successResultMap", successResultMap);

  if (Object.keys(failureResultMap).length > 0) {
    console.log("Failure Result Map:");
    console.log(failureResultMap);
  }
}

await traverseRules();
