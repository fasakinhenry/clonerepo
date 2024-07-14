#!/usr/bin/env node

const { program } = require('commander');
const { cloneAndPush } = require('../src/index');

program
  .version('1.0.0')
  .description(
    'CLI tool to clone a repository and push to personal GitHub profile'
  )
  .argument('<repoUrl>', 'Repository URL to clone')
  .argument('<username>', 'Your GitHub username')
  .option(
    '-t, --token <token>',
    'Your GitHub personal access token',
    process.env.GITHUB_TOKEN
  )
  .action((repoUrl, username, options) => {
    const token = options.token;
    if (!token) {
      console.error(
        'GitHub token is required. Use the --token option or set the GITHUB_TOKEN environment variable.'
      );
      process.exit(1);
    }
    cloneAndPush(repoUrl, username, token);
  });

program.parse(process.argv);
