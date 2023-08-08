const fs = require('fs').promises;
const path = require('path');
const parse = require('lcov-parse');
const https = require('https');
const crypto = require('crypto');
const { url } = require('inspector');
const { exec } = require('child_process');

/**
 * Converts a Coverage report .info file to a JavaScript object
 * @param reportFile path to the Coverage Report file or URL
 * @returns Promise containing the parsed data
 */
async function coverageReportToJs(reportFile, noOfCoverageFiles) {
  if (isURL(reportFile)) {
    if (isS3Directory(reportFile)) {
      // try {
        const buildNumber = reportFile.match(/\/coverage\/(\d+)\/$/)[1];
        for (let i = 1; i <= noOfCoverageFiles; i++) {
          const fileUrl = `${reportFile}${buildNumber}.${i}.info`;
          const content = await fetchContentFromURL(fileUrl);
          const filePath = `coverage/${buildNumber}.${i}.info`;
          await saveContentToLocalFile(filePath, content);
        }
        let mergedFilePath = await executeLcovResultMerger(`coverage/${buildNumber}.*.info`, `coverage/${buildNumber}_merged.info`);
        return await parseCoverageReport(mergedFilePath);
      /*} catch (err) {
        throw new Error(`Error fetching coverage files from S3 Directory: ${err.message}`);
      }*/
    }
    else {
      try {
        const content = await fetchContentFromURL(reportFile);
        const tempFilePath = path.resolve(__dirname, generateTempFilename(reportFile));
        console.log('**path**', tempFilePath);
        await saveContentToLocalFile(tempFilePath, content);
        return await parseCoverageReport(tempFilePath);
      } catch (err) {
        throw new Error(`Error fetching content from URL: ${err.message}`);
      }
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

function isS3Directory(url) {
  const s3PathRegex = /^https:\/\/[\w.-]+\.s3\.amazonaws\.com\/([^?#]+\/)$/;
  return s3PathRegex.test(url);
}

function fetchContentFromURL(url) {
  console.log(`** fetching File from URL: ${url} **`)
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

function executeLcovResultMerger(inputPattern, outputFilePath) {
  return new Promise((resolve, reject) => {
    const command = `npx lcov-result-merger '${inputPattern}' '${outputFilePath}'`;
    console.log('command: ', command);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log('failed to merge: ', error);
        reject(error);
        return;
      }
      resolve(outputFilePath);
    });
  });
}

async function saveContentToLocalFile(filePath, content) {
  try {
    const directoryPath = path.dirname(filePath);
    console.log('directoryPath ', directoryPath);
    await fs.mkdir(directoryPath, { recursive: true });
    await fs.writeFile(filePath, content, 'utf8');
  } catch (err) {
    throw new Error(`Error writing content to local file: ${err.message}`);
  }
}

async function parseCoverageReport(filePath) {
  console.log('filePath to parse: ', filePath);
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
}

function generateTempFilename(url) {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  return `coverage/coverage_${hash}.info`;
}

module.exports = coverageReportToJs;
