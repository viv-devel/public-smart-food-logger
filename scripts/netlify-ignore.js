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
  /^scripts\/backend-filter\.js$/,
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

function fetchGitHubPage(url, asJson = true) {
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
            if (asJson) {
              const result = JSON.parse(data);
              resolve(result);
            } else {
              resolve(data);
            }
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

// Check if package.json changes are only version bumps
async function isPackageJsonVersionOnly(filePath, isFileChangeListFromGitHub) {
  try {
    let beforePkg, afterPkg;

    if (isFileChangeListFromGitHub) {
      // GitHub API Mode
      console.log(`Checking ${filePath} changes via GitHub API...`);

      // Fetch Pull Request details to get base/head SHA
      // Optimization: Fetch these only once if possible, but for simplicity/robustness we fetch per file for now (or assume global CONTEXT provides diff refs?)
      // Actually, process.env.COMMIT_REF and CACHED_COMMIT_REF might not be reliable for file CONTENT fetching in PR context depending on how Netlify sets them.
      // Reliable way in PR: get PR head/base SHA from API.

      const prUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${REVIEW_ID}`;
      const pr = await fetchGitHubPage(prUrl);
      const baseSha = pr.base.sha;
      const headSha = pr.head.sha;

      const baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${baseSha}`;
      const headUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${headSha}`;

      const fetchContent = (url) => {
        return new Promise((resolve, reject) => {
          const options = {
            headers: {
              "User-Agent": "Netlify-Ignore-Script",
              Accept: "application/vnd.github.v3.raw",
            },
          };
          if (process.env.GITHUB_TOKEN) {
            options.headers["Authorization"] =
              `token ${process.env.GITHUB_TOKEN}`;
          }
          https
            .get(url, options, (res) => {
              if (res.statusCode !== 200) {
                reject(new Error(`GitHub API failed: ${res.statusCode}`));
                return;
              }
              let data = "";
              res.on("data", (chunk) => (data += chunk));
              res.on("end", () => resolve(JSON.parse(data)));
            })
            .on("error", reject);
        });
      };

      beforePkg = await fetchContent(baseUrl);
      afterPkg = await fetchContent(headUrl);
    } else {
      // Git Mode
      console.log(`Checking ${filePath} changes via local Git...`);
      // Use CACHED_COMMIT_REF (base) and COMMIT_REF (head)
      const beforeContent = execSync(
        `git show ${CACHED_COMMIT_REF}:${filePath}`,
        { encoding: "utf8" },
      );
      const afterContent = execSync(`git show ${COMMIT_REF}:${filePath}`, {
        encoding: "utf8",
      });
      beforePkg = JSON.parse(beforeContent);
      afterPkg = JSON.parse(afterContent);
    }

    // Compare fields
    // If any of these change, we MUST build.
    // If only 'version' changes, we can skip.
    const importantFields = [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "scripts",
      "engines",
      "workspaces",
    ];
    for (const field of importantFields) {
      if (
        JSON.stringify(beforePkg[field]) !== JSON.stringify(afterPkg[field])
      ) {
        console.log(`Confirmed relevant change in '${field}' of ${filePath}`);
        return false; // Real change detected
      }
    }

    console.log(
      `Only version (or irrelevant fields) changed in ${filePath}. Ignoring.`,
    );
    return true; // Safe to ignore
  } catch (err) {
    // If checking fails (e.g. file deleted/moved), assume meaningful change -> Build
    console.error(`Error analyzing ${filePath}:`, err.message);
    return false; // Assume unsafe on error
  }
}

async function checkChanges(files, isGitHub) {
  if (files.length === 0) {
    console.log("No changes detected.");
    process.exit(0); // Skip build
  }

  console.log("Changed files:", files);

  // 1. Identify package.json files
  const packageJsonFiles = files.filter((f) => f.endsWith("package.json"));
  let filesToIgnore = [];

  // 2. Check each package.json
  for (const pkgFile of packageJsonFiles) {
    const isVersionOnly = await isPackageJsonVersionOnly(pkgFile, isGitHub);
    if (isVersionOnly) {
      filesToIgnore.push(pkgFile);
      console.log(`Marking ${pkgFile} as safe to ignore (version only).`);
    } else {
      console.log(`${pkgFile} has significant changes.`);
    }
  }

  // 3. Filter relevant files
  const relevantFiles = files.filter((file) => {
    // If file is in filesToIgnore, skip it
    if (filesToIgnore.includes(file)) {
      return false;
    }

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
    const isGitHub = CONTEXT === "deploy-preview" && !!REVIEW_ID;
    const files = await getChangedFiles();
    await checkChanges(files, isGitHub);
  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1); // Force build on error
  }
})();
