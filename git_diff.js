const { exec, execSync } = require("child_process");

function getDiffWithLineNumbers(baseBranch) {
  return new Promise((resolve, reject) => {
    exec(`git diff --name-only ${baseBranch}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      console.log("stdout: ", stdout);
      let files = stdout.split("\n");
      files.pop();
      console.log("files: ", files);
      let prData = [];
      for (const file of files) {
        const regex = /\+([^\n]+)/g;
        let allChangedLines;
        try {
          allChangedLines = execSync(
            `git diff --unified=0 ${baseBranch} --ignore-all-space ${file} | grep -E '^\\+\\+\\+' -v | grep -E '^\\+'`
          ).toString();
        } catch (err) {
          console.log(`Seems Like No New Stuff was added in ${file}. Skipping It.`);
          continue;
        }
        allChangedLines = allChangedLines.trim();

        let linesNos = execSync(
          `git diff --unified=0 ${baseBranch} -- ${file} | grep -e '^@@' | awk -F'@@' '{print $2}'`
        ).toString();
        linesNos = linesNos.trim();
        let matches = linesNos.match(regex).map((match) => match.substring(1));
        matches = matches.map((s) => s.trim());

        let data = [];
        let changedLineArray = allChangedLines.split("\n");
        for (const string of matches) {
          if (string.includes(",")) {
            const [number, iterations] = string.split(",");
            if (!isNaN(Number(iterations))) {
              const count = parseInt(iterations, 10);
              let dataToConcat = { lineNumber: number, endsAfter: iterations, line: [] };
              for (let i = 0; i < count; i++) {
                let lineData = changedLineArray.shift();
                lineData = lineData && lineData.replace(/^\+/, "").trim();
                dataToConcat.line.push(lineData);
              }
              data.push(dataToConcat);
            } else {
              console.log("Invalid number of iterations");
            }
          } else {
            let lineData = changedLineArray.shift();
            lineData = lineData.replace(/^\+/, "").trim();
            data.push({ lineNumber: string, endsAfter: "1", line: [lineData] });
          }
        }
        prData.push({ fileName: file, data });
      }
      resolve(prData);
    });
  });
}

module.exports = getDiffWithLineNumbers;
