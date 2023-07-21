const findUncoveredCodeInPR = require('./analyze');
const createAnnotations = require('./annotations');

var parse = require('lcov-parse');

const prData = [
  {
    fileName: ".github/workflows/pull_request.yml",
    data: [
      {
        lineNumber: '19',
        endsAfter: '3',
        line: [
          '- uses: actions/checkout@v3',
          'with:',
          'fetch-depth: 0 # needed to checkout all branches for this Action to work'
        ]
      },
      {
        lineNumber: '25',
        endsAfter: '5',
        line: [
          '- name: Test Coverage Annotation',
          'uses: ZainAmjad68/test-coverage-annotate@main',
          'with:',
          'token: ${{ secrets.GITHUB_TOKEN }}',
          ''
        ]
      }
    ]
  },
  {
    fileName: "controllers/app.js",
    data: [
      {
        lineNumber: '12',
        endsAfter: '5',
        line: [
          'function dummyUncovered(x,y) {',
          'if (x) { return x; }',
          'else { return y; }',
          '}',
          ''
        ]
      },
      {
        lineNumber: '23',
        endsAfter: '19',
        line: [
          '',
          'let credentials;',
          '',
          'try {',
          'const AWS = require("aws-sdk");',
          'const smc = new AWS.SecretsManager();',
          '',
          'credentials = await smc',
          '.getSecretValue({ SecretId: `app_sftp_import-${clientName}` })',
          '.promise();',
          'credentials = JSON.parse(credentials.SecretString);',
          '} catch (err) {',
          'throw new Error(',
          '`Failed to Get the Credentials for ${clientName}. Error: ${err}`',
          ');',
          '}',
          'importJob.ftp["username"] = credentials.username;',
          'importJob.ftp["password"] = credentials.password;',
          ''
        ]
      }
    ]
  },
  {
    fileName: "modules/caremerge.js",
    data: [
      {
        lineNumber: '11',
        endsAfter: '13',
        line: [
          '',
          'const AWS = require("aws-sdk");',
          'const smc = new AWS.SecretsManager({',
          'region: "us-east-1",',
          '});',
          '',
          'let credentials = await smc',
          '.getSecretValue({',
          'SecretId: `app_sftp_import-${clientName}`,',
          '})',
          '.promise();',
          'credentials = JSON.parse(credentials.SecretString);',
          ''
        ]
      },
      {
        lineNumber: '26',
        endsAfter: '2',
        line: ['id: credentials.client_id,', 'secret: credentials.secret,']
      },
      {
        lineNumber: '49',
        endsAfter: '1',
        line: ['']
      }
    ]
  },
  {
    fileName: "test/fixtures/credentials.js",
    data: [
      {
        lineNumber: '1',
        endsAfter: '11',
        line: [
          'module.exports = function () {',
          'return {',
          'ARN: "x",',
          'Name: "test_creds",',
          'VersionId: "x",',
          'SecretString:',
          `'{"client_id":"test" , "secret":"secret" , "username":"test", "password":"password"}',`,
          'VersionStages: ["x"],',
          'CreatedDate: "x",',
          '};',
          '};'
        ]
      }
    ]
  },
  {
    fileName: "test/importJobs/appSftpResFamilyBRS.js",
    data: [
      {
        lineNumber: '10',
        endsAfter: '1',
        line: ['const getCredentials = require("../fixtures/credentials");']
      },
      {
        lineNumber: '20',
        endsAfter: '1',
        line: ['this.credentials = getCredentials();']
      },
      {
        lineNumber: '22',
        endsAfter: '3',
        line: [
          'aws.mock("SecretsManager", "getSecretValue", (params, callback) => {',
          'callback(null, this.credentials);',
          '});'
        ]
      },
      {
        lineNumber: '27',
        endsAfter: '3',
        line: ['if (this.sandbox) {', '}', 'username: "test",']
      },
      {
        lineNumber: '403',
        endsAfter: '2',
        line: ['password: "password",', undefined]
      }
    ]
  },
  {
    fileName: "test/importJobs/appSftpResFamilyCLC.js",
    data: [
      {
        lineNumber: '10',
        endsAfter: '1',
        line: ['const getCredentials = require("../fixtures/credentials");']
      },
      {
        lineNumber: '20',
        endsAfter: '1',
        line: ['this.credentials = getCredentials();']
      },
      {
        lineNumber: '22',
        endsAfter: '3',
        line: [
          'aws.mock("SecretsManager", "getSecretValue", (params, callback) => {',
          'callback(null, this.credentials);',
          '});'
        ]
      },
      {
        lineNumber: '27',
        endsAfter: '3',
        line: ['if (this.sandbox) {', '}', 'username: "test",']
      },
      {
        lineNumber: '537',
        endsAfter: '2',
        line: ['password: "password",', undefined]
      }
    ]
  },
  {
    fileName: "test/importJobs/appSftpResFamilyPCC.js",
    data: [
      {
        lineNumber: '10',
        endsAfter: '1',
        line: ['const getCredentials = require("../fixtures/credentials");']
      },
      {
        lineNumber: '20',
        endsAfter: '1',
        line: ['this.credentials = getCredentials();']
      },
      {
        lineNumber: '22',
        endsAfter: '3',
        line: [
          'aws.mock("SecretsManager", "getSecretValue", (params, callback) => {',
          'callback(null, this.credentials);',
          '});'
        ]
      },
      {
        lineNumber: '27',
        endsAfter: '3',
        line: ['if (this.sandbox) {', '}', 'username: "test",']
      },
      {
        lineNumber: '290',
        endsAfter: '2',
        line: ['password: "password",', undefined]
      }
    ]
  },
  {
    fileName: "test/importJobs/appSftpResSparrow.js",
    data: [
      {
        lineNumber: '10',
        endsAfter: '1',
        line: ['const getCredentials = require("../fixtures/credentials");']
      },
      {
        lineNumber: '20',
        endsAfter: '1',
        line: ['this.credentials = getCredentials();']
      },
      {
        lineNumber: '22',
        endsAfter: '3',
        line: [
          'aws.mock("SecretsManager", "getSecretValue", (params, callback) => {',
          'callback(null, this.credentials);',
          '});'
        ]
      },
      {
        lineNumber: '27',
        endsAfter: '3',
        line: ['if (this.sandbox) {', '}', 'username: "test",']
      },
      {
        lineNumber: '168',
        endsAfter: '2',
        line: ['password: "password",', undefined]
      }
    ]
  },
  {
    fileName: "test/importJobs/appSftpStaffBuckner.js",
    data: [
      {
        lineNumber: '10',
        endsAfter: '1',
        line: ['const getCredentials = require("../fixtures/credentials");']
      },
      {
        lineNumber: '20',
        endsAfter: '1',
        line: ['this.credentials = getCredentials();']
      },
      {
        lineNumber: '22',
        endsAfter: '3',
        line: [
          'aws.mock("SecretsManager", "getSecretValue", (params, callback) => {',
          'callback(null, this.credentials);',
          '});'
        ]
      },
      {
        lineNumber: '27',
        endsAfter: '3',
        line: ['if (this.sandbox) {', '}', 'username: "test",']
      },
      {
        lineNumber: '202',
        endsAfter: '2',
        line: ['password: "password",', undefined]
      }
    ]
  },
  {
    fileName: "test/index.js",
    data: [
      {
        lineNumber: '14',
        endsAfter: '1',
        line: ['const getCredentials = require("./fixtures/credentials");']
      },
      {
        lineNumber: '27',
        endsAfter: '4',
        line: [
          'this.credentials = getCredentials();',
          'aws.mock("SecretsManager", "getSecretValue", (params, callback) => {',
          'callback(null, this.credentials);',
          '});'
        ]
      },
      {
        lineNumber: '98',
        endsAfter: '1',
        line: ['process.env.NODE_ENV = "test";']
      }
    ]
  }
];

(async function() {
    parse('./lcov.info', async function(err, data) {

      let filesWithMatches = await findUncoveredCodeInPR(prData, data, ['lines']);
      console.log(filesWithMatches);

      const annotations = createAnnotations(filesWithMatches, 'detailed');
      console.log('Annotations: ', annotations);

    });

})();