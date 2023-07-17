const fs = require('fs');
const path = require('path');
const parse = require('lcov-parse');

/**
 * Converts a Coverage report .info file to a JavaScript object
 * @param reportFile path to the Coverage Report file
 * @returns Promise containing the parsed data
 */
function coverageReportToJs(reportFile) {
  return new Promise((resolve, reject) => {
    const reportPath = path.resolve(reportFile);
    if (!fs.existsSync(reportPath)) {
      reject(new Error(`The lcov.info file "${reportFile}" could not be resolved.`));
      return;
    }

    parse(reportPath, (err, data) => {
      if (err) {
        reject(new Error(`Encountered an Error while going through the coverage file at "${reportFile}": ${err}`));
        return;
      }
      // Process the data here
      resolve(data);
    });
  });
}

module.exports = coverageReportToJs;
