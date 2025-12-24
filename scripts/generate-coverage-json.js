const fs = require("fs");
const path = require("path");

const packages = ["frontend", "backend", "shared"];
let totalStatements = 0;
let totalCoveredStatements = 0;
let packageCount = 0;

packages.forEach((pkg) => {
  const summaryPath = path.join(
    __dirname,
    "..",
    pkg,
    "coverage",
    "coverage-summary.json",
  );
  if (fs.existsSync(summaryPath)) {
    try {
      const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
      // coverage-summary.json has a "total" key at the top level
      if (summary.total && summary.total.statements) {
        totalStatements += summary.total.statements.total;
        totalCoveredStatements += summary.total.statements.covered;
        packageCount++;
      }
    } catch (e) {
      console.error(`Error reading coverage for ${pkg}:`, e);
    }
  } else {
    console.warn(`No coverage summary found for ${pkg}`);
  }
});

let coveragePct = 0;
if (totalStatements > 0) {
  coveragePct = Math.round((totalCoveredStatements / totalStatements) * 100);
}

// Determine color
// Green: >= 80, Yellow: 50-79, Red: < 50
let color = "red";
if (coveragePct >= 80) {
  color = "green";
} else if (coveragePct >= 50) {
  color = "yellow";
}

const badgeData = {
  schemaVersion: 1,
  label: "coverage",
  message: `${coveragePct}%`,
  color: color,
};

const outputPath = path.join(__dirname, "..", "coverage.json");
fs.writeFileSync(outputPath, JSON.stringify(badgeData, null, 2));

console.log(
  `Coverage badge generated: ${coveragePct}% (${totalCoveredStatements}/${totalStatements})`,
);
