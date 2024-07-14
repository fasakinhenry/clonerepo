#!/usr/bin/env node

import { program } from 'commander';
import open from 'open';
import dotenv from 'dotenv';
import { cloneAndPush } from '../src/index.js';

dotenv.config();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

const authenticate = async () => {
  open(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo`
  );
};

program
  .version('1.0.0')
  .description(
    'CLI tool to clone a repository and push to personal GitHub profile'
  )
  .argument('<repoUrl>', 'Repository URL to clone')
  .argument('<username>', 'Your GitHub username')
  .option('-t, --token <token>', 'GitHub personal access token')
  .action(async (repoUrl, username, options) => {
    const githubToken = options.token || process.env.GITHUB_TOKEN;

    if (!repoUrl || !username) {
      console.error('Error: Missing required arguments: repoUrl and username');
      program.help(); // Display help information
      return;
    }

    if (!githubToken) {
      console.log('No token provided, starting OAuth authentication...');
      await authenticate();
    } else {
      console.log('Using provided token for authentication...');
      await cloneAndPush(repoUrl, username, githubToken);
    }
  });

program.parse(process.argv);

if (program.args.length < 2) {
  console.error('Error: Missing required arguments: repoUrl and username');
  program.help();
  process.exit(1);
}
