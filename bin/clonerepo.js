#!/usr/bin/env node

const { program } = require('commander');
const { cloneAndPush } = require('../src/index');

program
  .version('1.0.0')
  .description('Clone a repository and push to your personal GitHub profile')
  .argument('<repoUrl>', 'Repository URL to clone')
  .argument('<username>', 'Your GitHub username')
  .argument('<token>', 'Your GitHub personal access token')
  .action((repoUrl, username, token) => {
    cloneAndPush(repoUrl, username, token);
  });

program.parse(process.argv);
