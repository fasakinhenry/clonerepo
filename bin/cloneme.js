#!/usr/bin/env node

const { program } = require('commander');
const { cloneAndPush } = require('../src/index');
const open = require('open');
const axios = require('axios');
require('dotenv').config();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

let githubToken = null;

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
    githubToken = options.token || process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.log('No token provided, starting OAuth authentication...');
      await authenticate();
    } else {
      console.log('Using provided token for authentication...');
    }

    cloneAndPush(repoUrl, username, githubToken);
  });

program.parse(process.argv);
