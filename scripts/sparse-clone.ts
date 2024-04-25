import shell from "shelljs";
import fs from "node:fs";
import { TARGET_DIRECTORY, SPARSE_CLONE_DIRECTORY } from "./constants.js";

// Function to initialize or reconfigure sparse-checkout
function configureSparseCheckout(cloneDirectory: string) {
  console.log("Configuring sparse-checkout...");
  // Initialize sparse-checkout if not already initialized
  if (!fs.existsSync(".oxc_sparse/.git/info/sparse-checkout")) {
    if (shell.exec("git sparse-checkout init --cone").code !== 0) {
      shell.echo("Error: Failed to initialize sparse-checkout");
      shell.exit(1);
    }
  }

  // Set the directory to be checked out
  if (shell.exec(`git sparse-checkout set ${cloneDirectory}`).code !== 0) {
    shell.echo("Error: Failed to configure sparse-checkout");
    shell.exit(1);
  }
}

// Function to clone or update a repository
function cloneOrUpdateRepo(
  repositoryUrl: string,
  targetDirectory: string,
  cloneDirectory: string,
) {
  // Check if the target directory exists and is a Git repository
  if (
    fs.existsSync(targetDirectory) &&
    fs.existsSync(`${targetDirectory}/.git`)
  ) {
    console.log(`Repository exists, updating ${targetDirectory}...`);
    shell.cd(targetDirectory);
    configureSparseCheckout(cloneDirectory);
    // Pull the latest changes
    if (shell.exec("git pull").code !== 0) {
      shell.echo("Error: Git pull failed");
      shell.exit(1);
    }
    console.log(`Repository updated and configured for ${cloneDirectory}.`);
  } else {
    console.log(`Cloning new repository into ${targetDirectory}...`);
    // Clone the repository without checking out files
    if (
      shell.exec(
        `git clone --filter=blob:none --no-checkout ${repositoryUrl} ${targetDirectory}`,
      ).code !== 0
    ) {
      shell.echo("Error: Git clone failed");
      shell.exit(1);
    }
    shell.cd(targetDirectory);

    configureSparseCheckout(cloneDirectory);

    // Checkout the specified directory
    if (shell.exec("git checkout").code !== 0) {
      shell.echo("Error: Git checkout failed");
      shell.exit(1);
    }

    console.log(
      `Successfully cloned ${cloneDirectory} into ${targetDirectory}/${cloneDirectory}`,
    );
  }
}

// Example usage
cloneOrUpdateRepo(
  "https://github.com/oxc-project/oxc.git",
  TARGET_DIRECTORY,
  SPARSE_CLONE_DIRECTORY,
);