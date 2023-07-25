const fs = require('fs').promises;
const path = require('path');
const parse = require('lcov-parse');
const https = require('https');
const crypto = require('crypto');

/**
 * Converts a Coverage report .info file to a JavaScript object
 * @param reportFile path to the Coverage Report file or URL
 * @returns Promise containing the parsed data
 */
async function coverageReportToJs(reportFile) {
  if (isURL(reportFile)) {
    try {
      const content = await fetchContentFromURL(reportFile);
      const tempFilePath = path.resolve(__dirname, generateTempFilename(reportFile));
      console.log('**path**', tempFilePath);
      await saveContentToLocalFile(tempFilePath, content);
      return await parseCoverageReport(tempFilePath);
    } catch (err) {
      throw new Error(`Error fetching content from URL: ${err.message}`);
    }
  } else {
    const reportPath = path.resolve(reportFile);
    console.log('**path**', reportPath);
    try {
      return await parseCoverageReport(reportPath);
    } catch (err) {
      throw new Error(`Error parsing coverage report: ${err.message}`);
    }
  }
}

function isURL(str) {
  return /^(http|https):\/\//.test(str);
}

function fetchContentFromURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function saveContentToLocalFile(filePath, content) {
  try {
    await fs.writeFile(filePath, content, 'utf8');
  } catch (err) {
    throw new Error(`Error writing content to local file: ${err.message}`);
  }
}

async function parseCoverageReport(filePath) {
  try {
    const data = await new Promise((resolve, reject) => {
      parse(filePath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });

    return data;
  } catch (err) {
    throw new Error(`Error parsing coverage report: ${err.message}`);
  }
}

function generateTempFilename(url) {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return `coverage_${hash}.info`;
}

module.exports = coverageReportToJs;
