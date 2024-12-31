# clonerepo
This is a tool that helps you to clone repos to your profile easily without forking the repository

## Usage

To use this tool, follow the steps below:

1. **Install dependencies**:
    ```bash
    npm install
    ```

2. **Run the script**:
    ```bash
    node src/index.js
    ```

## Functions

### `cloneRepository(git, repoUrl, retryCount = 3)`
Clones the repository from the given URL with a specified number of retries.

### `rewriteCommitHistory(repoGit)`
Rewrites the commit history to a single "Initial commit".

### `cleanupDirectory(directoryPath)`
Deletes the specified directory if it exists.

### `cloneAndPush(repoUrl, username, token)`
Clones the repository, optionally rewrites the commit history, creates a new repository on GitHub, sets the remote origin, and pushes to the new repository. Optionally cleans up the local repository folder.

## Dependencies

- `simple-git`
- `@octokit/rest`
- `path`
- `fs-extra`
- `inquirer`

## Example

```javascript
import { cloneAndPush } from './src/index.js';

const repoUrl = 'https://github.com/user/repo.git';
const username = 'your-github-username';
const token = 'your-github-token';

cloneAndPush(repoUrl, username, token);
```

It also can create a new repository right from the terminal using Github OAuth token.
