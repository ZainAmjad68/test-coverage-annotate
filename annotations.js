let pluralToSingularMap = {
    'functions': 'function',
    'branches': 'branch',
    'lines': 'line',
}
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE;


function summarizeAnnotations(data) {
    const formattedData = {};
    
    Object.entries(data).forEach(([filename, annotations]) => {
      const annotationMap = new Map();
  
      annotations.forEach(annotation => {
        const { lineNumber, annotationType } = annotation;
        if (annotationMap.has(annotationType)) {
          annotationMap.get(annotationType).push(lineNumber);
        } else {
          annotationMap.set(annotationType, [lineNumber]);
        }
      });
  
      const formattedAnnotations = {};
      annotationMap.forEach((lineNumbers, annotationType) => {
        formattedAnnotations[annotationType] = lineNumbers;
      });
  
      formattedData[filename] = formattedAnnotations;
    });
  
    return formattedData;
  }

function createAnnotations(uncoveredData, coverageType) {
    let annotations = [];
    if (coverageType === 'summarize') {
        let summarizedData = summarizeAnnotations(uncoveredData);
        console.log('summarizedData', summarizedData);
        for (const file in summarizedData) {
            let message = '';
            Object.entries(summarizedData[file]).forEach(([annotationType, linesArray]) => {
                message += `The ${annotationType} at place(s) ${linesArray.join(', ')} were not covered by any of the Tests.\n`;
              });            
            console.log('message', message);

            const filePathTrimmed = file.replace(`${GITHUB_WORKSPACE}/`, '');
            annotations.push({
                path: filePathTrimmed,
                start_line: 0,
                end_line: 0,
                annotation_level: 'warning',
                title: `** Summary of Uncovered Code **`,
                message: message
            })
        }
    } else if (coverageType === 'detailed') {
        for (const file in uncoveredData) {
            if (Array.isArray(uncoveredData[file])) {
                uncoveredData[file].forEach(annotation => {
                    const filePathTrimmed = file.replace(`${GITHUB_WORKSPACE}/`, '');
                    annotations.push({
                        path: filePathTrimmed,
                        start_line: annotation.lineNumber,
                        end_line: annotation.lineNumber,
                        annotation_level: 'warning',
                        title: `!!!Uncovered ${annotation.annotationType} Found!!!`,
                        message: `This ${pluralToSingularMap[annotation.annotationType]} is not covered by any of the Tests.`
                    })
                });
            }
        }
    }
    return annotations;
}

module.exports = createAnnotations;
