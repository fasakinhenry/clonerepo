import simpleGit from 'simple-git';
import { Octokit } from '@octokit/rest';
import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';

const cloneRepository = async (git, repoUrl, retryCount = 3) => {
  while (retryCount > 0) {
    try {
      await git.clone(repoUrl);
      console.log(`Successfully cloned ${repoUrl}`);
      return;
    } catch (error) {
      console.error(`Error cloning repository: ${error.message}`);
      retryCount -= 1;
      console.log(`Retries left: ${retryCount}`);
      if (retryCount === 0) {
        throw new Error('Failed to clone repository after multiple attempts');
      }
    }
  }
};

const rewriteCommitHistory = async (repoGit) => {
  // Ensure the branch is up-to-date and reset
  await repoGit.fetch(); // Fetch latest changes
  await repoGit.reset('hard', 'origin/main'); // Reset to remote state
  await repoGit.add('./*'); // Add all files
  await repoGit.commit('Initial commit'); // Create a new commit
};

const cleanupDirectory = async (directoryPath) => {
  try {
    // Check if the directory exists before trying to delete
    if (fs.existsSync(directoryPath)) {
      // Wait a bit before removing the directory
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Remove the directory
      await fs.remove(directoryPath);
      console.log(`Deleted local repository folder ${directoryPath}`);
    } else {
      console.log(`Directory ${directoryPath} does not exist.`);
    }
  } catch (error) {
    console.error(`Error deleting local repository folder: ${error.message}`);
  }
};

const cloneAndPush = async (repoUrl, username, token) => {
  const repoName = path.basename(repoUrl, '.git');
  const git = simpleGit(); // Simple-git instance for the parent directory

  console.log('Starting cloning process...');
  try {
    // Clone the repository with retries
    console.log(`Cloning ${repoUrl}...`);
    await cloneRepository(git, repoUrl);
    process.chdir(repoName);
    console.log(`Changed to directory ${repoName}.`);

    // Verify the repository was cloned
    const gitDir = path.join(process.cwd(), '.git');
    if (!fs.existsSync(gitDir)) {
      throw new Error(`Failed to clone the repository: ${repoUrl}`);
    }

    // Create a new instance of simple-git within the cloned repository
    const repoGit = simpleGit(process.cwd());

    // Initialize the Git repository in the new directory
    await repoGit.init();
    console.log('Initialized new Git repository.');

    // Ask user if they want to rewrite commit history or keep it
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'commitHistory',
        message:
          'Do you want to rewrite the entire commit history or keep it as it is?',
        choices: [
          'Rewrite to a single "Initial commit"',
          'Keep existing history',
        ],
      },
    ]);

    // Rewrite commit history if user chooses to do so
    if (answers.commitHistory === 'Rewrite to a single "Initial commit"') {
      console.log('Rewriting commit history...');
      await rewriteCommitHistory(repoGit);
      console.log('Commit history rewritten to a single "Initial commit".');
    } else {
      console.log('Keeping existing commit history.');
    }

    // Create a new repository on the user's GitHub account
    console.log('Creating a new repository on GitHub...');
    const octokit = new Octokit({ auth: token });
    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: false,
    });

    const newRepoUrl = response.data.clone_url;
    console.log(`New repository created at ${newRepoUrl}`);

    // Set the remote origin to the new repository
    console.log('Setting remote origin to the new repository...');
    const remotes = await repoGit.getRemotes();
    if (remotes.find((remote) => remote.name === 'origin')) {
      await repoGit.remote(['set-url', 'origin', newRepoUrl]);
    } else {
      await repoGit.addRemote('origin', newRepoUrl);
    }
    console.log('Remote origin set.');

    // Push to the new repository
    console.log('Pushing to the new repository...');
    await repoGit.push(['-u', 'origin', 'main']);
    console.log(`Repository successfully cloned and pushed to ${newRepoUrl}`);

    // Ask user if they want to clean up the local repository
    const cleanupAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'cleanup',
        message: 'Do you want to delete the local repository folder?',
        default: false,
      },
    ]);

    // Perform cleanup if user chooses to do so
    if (cleanupAnswer.cleanup) {
      const parentDir = path.resolve('..'); // Get the parent directory
      const localRepoPath = path.join(parentDir, repoName);

      // Call cleanupDirectory to handle the cleanup
      await cleanupDirectory(localRepoPath);
    } else {
      console.log('Local repository folder kept.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

export { cloneAndPush };
