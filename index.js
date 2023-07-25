const core = require('@actions/core');
const {Octokit} = require('@octokit/rest');
const fetch = require("node-fetch");
const {Toolkit} = require('actions-toolkit');
const getDiffWithLineNumbers = require('./git_diff');
const coverageReportToJs = require('./lcov-to-json');
const findUncoveredCodeInPR = require('./analyze');
const createAnnotations = require('./annotations');
const createOrUpdateCheck = require('./check-run');

Toolkit.run(async (tools) => {
  try {
    const githubToken = core.getInput('token');
    const octokit = new Octokit({
      previews: ['antiope'],
      auth: githubToken,
      request: {fetch}
    });

    const tools = new Toolkit({
      token: githubToken,
    });

    let createData = {
      started_at: new Date().toISOString(),
      status: 'in_progress',
      name: 'Test Coverage Annotate',
    };

    const eventType = core.getInput('action-type');
    console.log('eventType:', eventType);
    let PR;
    if (eventType === 'workflow_dispatch') {
      PR = await octokit.pulls.get({
        owner: tools.context.repo.owner,
        repo: tools.context.repo.repo,
        pull_number: tools.context.payload.inputs.pr_number,
      });
      PR = PR.data;
    } else {
      PR = tools.context.payload.pull_request;
    };

    const response = await createOrUpdateCheck(createData, 'create', tools, PR);
    let check_id = response.data.id;
    console.log(`Check Successfully Created`, check_id);

    let prData = await getDiffWithLineNumbers('HEAD^1');

    const coverageReportPath = core.getInput('coverage-info-path');
    let coverageJSON = await coverageReportToJs(coverageReportPath);

    let typesToCover = core.getInput('annotation-type');
    typesToCover = typesToCover.split(',').map(item => item.trim());
    
    let untestedLinesOfFiles = await findUncoveredCodeInPR(prData, coverageJSON, typesToCover);
    // Create appropriate annotations for uncovered code in files changed by the pull request and not covered with tests
    const coverage = core.getInput('annotation-coverage');
    const annotations = createAnnotations(untestedLinesOfFiles, coverage);
    let totalFiles = Object.keys(untestedLinesOfFiles).length;
    let totalWarnings = annotations.length;

    let updateData = {
      check_run_id: check_id,
      output: {
        title: 'Test Coverage Annotate',
        annotations: annotations
      }
    };
    if (!annotations.length) {
      updateData['output'].summary = 'All Good! We found No Uncovered Lines of Code in your Pull Request.';
    } else {
      updateData['output'].summary = `:::Found a Total of ${totalWarnings} Instances of Uncovered Code in ${totalFiles} Files!:::`;
    }
    await createOrUpdateCheck(updateData, 'update', tools, PR);
    console.log(`Check Successfully Updated`);

    // finally close the Check
    let completeData = {
      conclusion: 'success',
      status: 'completed',
      completed_at: new Date().toISOString()
    }
    completeData = { ...updateData, ...completeData };
    delete completeData['output'].annotations;
    await createOrUpdateCheck(completeData, 'update', tools, PR);
    console.log(`Check Successfully Closed`);

    /*
    console.log(`******* PR Data ********`);
    prData.forEach((fileData) => {
      console.log('--------------');
      console.log(`File: ${fileData.fileName}`);
      fileData.data.forEach((lineData) => {
        console.log(lineData);
      });
      console.log('--------------');
    });
    
    console.log(`******* Coverage Data ********`);
    coverageJSON.forEach((fileCoverage) => {
      console.log('--------------');
      console.log('Filename: ', fileCoverage.file);
      console.log('Title: ', fileCoverage.title);
      if (fileCoverage.functions && fileCoverage.functions.details) {
        console.log('fileCoverage.functions.found: ', fileCoverage.functions.found);
        console.log('fileCoverage.functions.hit: ', fileCoverage.functions.hit);
        fileCoverage.functions.details.forEach((detail) => {
          console.log(`fileCoverage.functions.details: `, detail);
        });
      }
      if (fileCoverage.lines && fileCoverage.lines.details) {
        console.log('fileCoverage.lines.found: ' ,fileCoverage.lines.found);
        console.log('fileCoverage.lines.hit: ',fileCoverage.lines.hit);
        fileCoverage.lines.details.forEach((detail) => {
          console.log(`fileCoverage.lines.details: `, detail);
        });
      }
      if (fileCoverage.branches && fileCoverage.branches.details) {
        console.log('fileCoverage.branches.found: ' ,fileCoverage.branches.found);
        console.log('fileCoverage.branches.hit: ',fileCoverage.branches.hit);
        fileCoverage.branches.details.forEach((detail) => {
          console.log(`fileCoverage.branches.details: `, detail);
        });
      }
      console.log('--------------');
    });
    */

  } catch (error) {
    tools.exit.failure(error.message);
  }

  // If we got this far things were a success
  tools.exit.success('PR Scan and Warn Analysis completed successfully!')
});