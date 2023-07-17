const core = require('@actions/core');
const {Octokit} = require('@octokit/rest');
const fetch = require("node-fetch");
const {Toolkit} = require('actions-toolkit');
const getDiffWithLineNumbers = require('./git_diff');
const coverageReportToJs = require('./lcov-to-json');

const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;

Toolkit.run(async (tools) => {
  try {
    const githubToken = core.getInput('token');
    const octokit = new Octokit({
      previews: ['antiope'],
      auth: githubToken,
      request: {fetch}
    });

    let prData = await getDiffWithLineNumbers('HEAD^1');
    tools.log(`PR Data ${prData}`);

  } catch (error) {
    tools.exit.failure(error.message);
  }

  // If we got this far things were a success
  tools.exit.success('PR Scan and Warn Analysis completed successfully!')
});