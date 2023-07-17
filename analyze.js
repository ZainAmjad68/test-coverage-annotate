const warningMap = require('./warning-map');

function findWordsInLine(line, lineNumber, wordsToScan) {
    let annotations = [];
    wordsToScan.forEach(word => {
        if (line.includes(word)) {
            console.log(`found ${word} in line ${lineNumber}`);
            console.log(`The Line was: ${line}`);
            let defaultAnnotation = `Please be careful about the use of ${word}. It can have dangerous consequences.`;
            annotations.push({
                lineNumber,
                wordFound: word,
                annotationMessage: warningMap[word] || defaultAnnotation,
            })
        }
    })
    return annotations;
}

function extractMatchingLines(prData, wordsToScan) {
  return new Promise((resolve, reject) => {
    let filesWithMatches = {};
    prData.forEach(file => {
        let fileName = file.fileName;
        filesWithMatches[fileName] = [];
        file.data.forEach(change => {
            let startLine = parseInt(change.lineNumber);
            for (let i = 0; i < change.endsAfter; i++) {
                const currentLineNumber = startLine + i;
                // check each word to see if it's present on the given lines within this PR data object
                let matches = findWordsInLine(change.line[i],currentLineNumber, wordsToScan);
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

module.exports = extractMatchingLines;
