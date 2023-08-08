let types = [];

// return all the possible annotations here, a line can be uncovered both as a function and as a line as well
// later when finalizing annotations, check if a line in a file has two, if so remove the lines one (and retain the function/branch one)

function checkCoverage(lineNumber, coverageDetails) {
    console.log(`lineNumber: ${lineNumber}`);
    for (const coverage of coverageDetails) {
        if (coverage.line === lineNumber) {
            console.log(`matched::: line: ${lineNumber}, hit: ${coverage.hit}, taken: ${coverage.taken}`)
            if (coverage.hit !== undefined && coverage.hit === 0) {
                return true;
            }
            if (coverage.taken !== undefined && coverage.taken === 0) {
                return true;
            }
        }
    }
    return false;
}

function checkIfLineUncoveredInCoverage(lineNumber, fileCoverage) {
    let annotations = [];

    types.forEach(type => {
        let lineExistsAndIsUncovered = false;
        if (type === 'functions') {
            lineExistsAndIsUncovered = checkCoverage(lineNumber, fileCoverage.functions.details);
        } else if (type === 'branches') {
            lineExistsAndIsUncovered = checkCoverage(lineNumber, fileCoverage.branches.details);
        } else if (type === 'lines') {
            lineExistsAndIsUncovered = checkCoverage(lineNumber, fileCoverage.lines.details);
        } else if (type === 'all') {
            const isLineUncovered = checkCoverage(lineNumber, fileCoverage.lines.details);
            const isFunctionUncovered = checkCoverage(lineNumber, fileCoverage.functions.details);
            const isBranchUncovered = checkCoverage(lineNumber, fileCoverage.branches.details);

            if (isLineUncovered) {
                annotations.push({
                    lineNumber,
                    annotationType: 'lines',
                });
            }
            if (isFunctionUncovered) {
                annotations.push({
                    lineNumber,
                    annotationType: 'functions',
                });
            }
            if (isBranchUncovered) {
                annotations.push({
                    lineNumber,
                    annotationType: 'branches',
                });
            }
            return; // Exit the loop to prevent 'all' from being pushed to annotations
        }

        if (lineExistsAndIsUncovered) {
            annotations.push({
                lineNumber,
                annotationType: type,
            });
        }
    });

    return annotations;
}

function findUncoveredCodeInPR(prData, coverageJSON, typesToCover) {
    types = typesToCover;
  return new Promise((resolve, reject) => {
    let filesWithMatches = {};
    prData.forEach(file => {
        let fileName = file.fileName;
        const fileCoverage = coverageJSON.find(coverageFile => coverageFile['file'] === fileName);
        if (!fileCoverage) {
            console.log(`File ${fileName} Not Found in Coverage Data.`);
            return;
        }
        console.log(`File ${fileName} was found in Coverage Data!!`);

        console.log('Data: ', file.data);
        filesWithMatches[fileName] = [];
        file.data.forEach(change => {
            let startLine = parseInt(change.lineNumber);
            for (let i = 0; i < change.endsAfter; i++) {
                const currentLineNumber = startLine + i;
                // check each word to see if it's present on the given lines within this PR data object
                let matches = checkIfLineUncoveredInCoverage(currentLineNumber, fileCoverage);
                if (matches && matches.length) {
                    matches.forEach(match => {
                        filesWithMatches[fileName].push(match);
                    });
                }
            }
        });
        if (filesWithMatches[fileName].length === 0) {
            delete filesWithMatches[fileName];
        }
    });
    resolve(filesWithMatches);
  });
}

module.exports = findUncoveredCodeInPR;
