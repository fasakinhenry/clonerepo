import simpleGit from 'simple-git';
import { Octokit } from '@octokit/rest';
import path from 'path';

const cloneAndPush = async (repoUrl, username, token) => {
  const git = simpleGit();
  const repoName = path.basename(repoUrl, '.git');

  try {
    // Clone the repository
    await git.clone(repoUrl);
    process.chdir(repoName);

    // Create a new repository on the user's GitHub account
    const octokit = new Octokit({ auth: token });
    const response = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      private: false,
    });

    const newRepoUrl = response.data.clone_url;

    // Push to the new repository
    await git.remote(['set-url', 'origin', newRepoUrl]);
    await git.push(['-u', 'origin', 'main']);

    console.log(`Repository successfully cloned and pushed to ${newRepoUrl}`);
  } catch (error) {
    console.error('Error:', error);
  }
};

export { cloneAndPush };
