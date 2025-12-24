const https = require("https");
const { execSync } = require("child_process");

// Configuration
const REPO_OWNER = "viv-devel";
const REPO_NAME = "public-smart-food-logger";
const SIGNIFICANT_PATHS = [
  /^frontend\//,
  /^shared\//,
  /^package\.json$/,
  /^pnpm-lock\.yaml$/,
  /^netlify\.toml$/,
  /^scripts\//,
];
const IGNORED_PATHS = [
  /^frontend\/test\//,
  /^shared\/test\//,
  /\.md$/,
  /^frontend\/\.env\.local\.example$/,
  /^frontend\/vitest\.config\.ts$/,
  /^frontend\/playwright\.config\.ts$/,
  /^shared\/vitest\.config\.ts$/,
];

// Environment variables
const { CONTEXT, REVIEW_ID, COMMIT_REF, CACHED_COMMIT_REF } = process.env;

console.log(`Context: ${CONTEXT}`);
console.log(`Review ID: ${REVIEW_ID}`);
console.log(`Commit Ref: ${COMMIT_REF}`);
console.log(`Cached Commit Ref: ${CACHED_COMMIT_REF}`);

async function getChangedFiles() {
  if (CONTEXT === "deploy-preview" && REVIEW_ID) {
    console.log("Deploy Preview detected. Fetching changes from GitHub API...");
    return await getChangedFilesFromGitHub(REVIEW_ID);
  } else {
    console.log("Using git diff for changed files...");
    return getChangedFilesFromGit();
  }
}

function getChangedFilesFromGit() {
  if (!CACHED_COMMIT_REF) {
    console.log("No cached commit ref. Forcing build.");
    process.exit(1);
  }

  try {
    const diffCommand = `git diff --name-only ${CACHED_COMMIT_REF} ${COMMIT_REF}`;
    console.log(`Running: ${diffCommand}`);
    const output = execSync(diffCommand, { encoding: "utf8" });
    return output.split("\n").filter((line) => line.trim() !== "");
  } catch (error) {
    console.error("Git diff failed:", error.message);
    console.log("Forcing build for safety.");
    process.exit(1);
  }
}

function fetchGitHubPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "Netlify-Ignore-Script",
      },
    };

    if (process.env.GITHUB_TOKEN) {
      options.headers["Authorization"] = `token ${process.env.GITHUB_TOKEN}`;
    }

    console.log(`Fetching: ${url}`);
    https
      .get(url, options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API failed with status ${res.statusCode}`));
          return;
        }

        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const files = JSON.parse(data);
            resolve(files);
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (e) => reject(e));
  });
}

async function getChangedFilesFromGitHub(prNumber) {
  let page = 1;
  let allFilenames = [];

  try {
    while (true) {
      const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${prNumber}/files?per_page=100&page=${page}`;
      const files = await fetchGitHubPage(url);

      if (!Array.isArray(files)) {
        throw new Error("GitHub API response is not an array");
      }

      const filenames = files.map((f) => f.filename);
      allFilenames = allFilenames.concat(filenames);

      if (files.length < 100) {
        break;
      }
      page++;
    }
  } catch (error) {
    console.error("Error fetching from GitHub:", error);
    console.log("Forcing build for safety.");
    process.exit(1);
  }

  return allFilenames;
}

function checkChanges(files) {
  if (files.length === 0) {
    console.log("No changes detected.");
    process.exit(0); // Skip build
  }

  console.log("Changed files:", files);

  const relevantFiles = files.filter((file) => {
    const isSignificant = SIGNIFICANT_PATHS.some((regex) => regex.test(file));
    const isIgnored = IGNORED_PATHS.some((regex) => regex.test(file));
    return isSignificant && !isIgnored;
  });

  if (relevantFiles.length > 0) {
    console.log("Build triggered by changes in:", relevantFiles);
    process.exit(1); // Trigger build
  } else {
    console.log("No relevant changes found. Skipping build.");
    process.exit(0); // Skip build
  }
}

// Main execution
(async () => {
  try {
    const files = await getChangedFiles();
    checkChanges(files);
  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1); // Force build on error
  }
})();
