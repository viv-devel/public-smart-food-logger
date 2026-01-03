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

function fetchGitHubPage(url, customOptions = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "Netlify-Ignore-Script",
        ...customOptions.headers,
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
            if (customOptions.raw) {
              resolve(data);
            } else {
              resolve(JSON.parse(data));
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
async function isPackageJsonVersionOnly(filePath, githubContext) {
  try {
    let beforePkg, afterPkg;

    if (githubContext) {
      // GitHub API Mode
      console.log(`Checking ${filePath} changes via GitHub API...`);

      const { baseSha, headSha } = githubContext;

      const baseUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${baseSha}`;
      const headUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${headSha}`;

      const fetchOptions = {
        headers: { Accept: "application/vnd.github.v3.raw" },
        raw: false, // Parse response as JSON (GitHub returns raw JSON file content with the Accept header)
      };

      beforePkg = await fetchGitHubPage(baseUrl, fetchOptions);
      afterPkg = await fetchGitHubPage(headUrl, fetchOptions);
    } else {
      // Git Mode
      console.log(`Checking ${filePath} changes via local Git...`);
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
    const importantFields = [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "scripts",
      "engines",
      "workspaces",
      "pnpm", // pnpm specific config like overrides
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

  // Optimization: Fetch PR info once if in GitHub mode and we have package.json files
  let githubContext = null;
  if (isGitHub && packageJsonFiles.length > 0) {
    try {
      const prUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls/${REVIEW_ID}`;
      const pr = await fetchGitHubPage(prUrl);
      githubContext = {
        baseSha: pr.base.sha,
        headSha: pr.head.sha,
      };
    } catch (e) {
      console.error("Failed to fetch PR info:", e);
      // Fallback or exit? If we can't get context, we can't verify package.json, so assume unsafe.
    }
  }

  // 2. Check each package.json
  for (const pkgFile of packageJsonFiles) {
    // Actually previously passed 'isFileChangeListFromGitHub' boolean.
    // Now I pass 'githubContext' object (truthy) OR null (falsy) for Git mode.
    // Wait, if isGitHub is true but githubContext failed, we should probably SKIP checking and trigger build for safety.

    if (isGitHub && !githubContext) {
      console.log(
        `Skipping optimization for ${pkgFile} due to missing GitHub context. Build will be triggered.`,
      );
      continue;
    }

    // For Git mode, githubContext is null, which is correct.
    const isVersionOnly = await isPackageJsonVersionOnly(
      pkgFile,
      githubContext,
    );
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
