import shell from 'shelljs';
import fs from 'node:fs';
import {
  TARGET_DIRECTORY,
  SPARSE_CLONE_DIRECTORY,
  VERSION_PREFIX,
} from './constants.js';
import packageJson from '../package.json' with { type: 'json' };

/**
 * Run this file in CLI like `pnpm run clone`
 * It clones the oxc_linter git project into your local file.
 *
 * You can run it with a version argument like `pnpm run clone 0.10.0`.
 * When no argument is provided, the current package.json version is used.
 *
 */

const checkoutVersion = process.argv[2] ?? packageJson.version;

// Function to initialize or reconfigure sparse-checkout
function configureSparseCheckout(cloneDirectory: string) {
  console.log('Configuring sparse-checkout...');
  // Initialize sparse-checkout if not already initialized
  if (
    !fs.existsSync('.oxc_sparse/.git/info/sparse-checkout') &&
    shell.exec('git sparse-checkout init --cone').code !== 0
  ) {
    shell.echo('Error: Failed to initialize sparse-checkout');
    shell.exit(1);
  }

  // Set the directory to be checked out
  if (shell.exec(`git sparse-checkout set ${cloneDirectory}`).code !== 0) {
    shell.echo('Error: Failed to configure sparse-checkout');
    shell.exit(1);
  }
}

function checkoutVersionTag(version: string) {
  const tag = `${VERSION_PREFIX}${version}`;

  // Checkout the specified directory
  if (shell.exec(`git checkout ${tag}`, { silent: true }).code !== 0) {
    shell.echo('Error: Git checkout failed');
    shell.exit(1);
  }

  console.log(`Successfully checkout git tag ${tag}`);
}

// Function to clone or update a repository
function cloneOrUpdateRepo(
  repositoryUrl: string,
  targetDirectory: string,
  cloneDirectory: string,
  version: string
) {
  // Check if the target directory exists and is a Git repository
  if (
    fs.existsSync(targetDirectory) &&
    fs.existsSync(`${targetDirectory}/.git`)
  ) {
    console.log(`Repository exists, updating ${targetDirectory}...`);

    shell.cd(targetDirectory);

    configureSparseCheckout(cloneDirectory);
    checkoutVersionTag(version);
  } else {
    console.log(`Cloning new repository into ${targetDirectory}...`);

    // Clone the repository without checking out files
    if (
      shell.exec(
        `git clone --filter=blob:none --no-checkout ${repositoryUrl} ${targetDirectory}`
      ).code !== 0
    ) {
      shell.echo('Error: Git clone failed');
      shell.exit(1);
    }

    shell.cd(targetDirectory);

    configureSparseCheckout(cloneDirectory);
    checkoutVersionTag(version);
  }
}

cloneOrUpdateRepo(
  'https://github.com/oxc-project/oxc.git',
  TARGET_DIRECTORY,
  SPARSE_CLONE_DIRECTORY,
  checkoutVersion
);
