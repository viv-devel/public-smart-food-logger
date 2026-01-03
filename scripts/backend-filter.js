#!/usr/bin/env node

/**
 * Backend Change Detection Script
 *
 * このスクリプトは、各Cloud Function（health, recaptcha, oauth, foodlog）について、
 * 変更があったかどうかを判定し、デプロイが必要かを返します。
 *
 * Usage: node backend-filter.js <function-name>
 * Output: "true" (デプロイ必要) または "false" (スキップ)
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Git コミット参照の定数
const BEFORE_COMMIT = process.env.GITHUB_EVENT_BEFORE || "HEAD~1";
const AFTER_COMMIT = process.env.GITHUB_SHA || "HEAD";

// 各関数の依存関係マップ
const FUNCTION_DEPENDENCIES = {
  health: {
    files: ["backend/src/health.ts", "backend/tsup.config.ts"],
    packages: [], // 依存なし
    sharedDirs: [], // shared を使用しない
  },
  recaptcha: {
    files: ["backend/src/recaptcha.ts", "backend/tsup.config.ts"],
    packages: ["node-fetch"],
    sharedDirs: [], // shared を使用しない
  },
  oauth: {
    files: [
      "backend/src/handlers/oauth.ts",
      "backend/src/services/**",
      "backend/src/utils/**",
      "backend/tsup.config.ts",
    ],
    packages: ["firebase-admin", "node-fetch"],
    sharedDirs: [], // 型のみの参照なのでデプロイ不要
  },
  foodlog: {
    files: [
      "backend/src/handlers/foodlog.ts",
      "backend/src/services/**",
      "backend/src/repositories/**",
      "backend/src/utils/**",
      "backend/tsup.config.ts",
    ],
    packages: ["firebase-admin", "node-fetch", "zod"],
    sharedDirs: [
      "shared/src/schema/**",
      "shared/src/external/**",
      "shared/package.json",
    ],
  },
};

// 無視するファイル
const IGNORED_FILES = [/^backend\/test\//, /^shared\/test\//, /\.md$/];

/**
 * Git diff で変更されたファイルのリストを取得
 */
function getChangedFiles() {
  try {
    const output = execSync(
      `git diff --name-only ${BEFORE_COMMIT} ${AFTER_COMMIT}`,
      {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      },
    );
    return output.split("\n").filter((line) => line.trim() !== "");
  } catch (error) {
    console.error("Git diff failed:", error.message);
    // エラー時は安全のためデプロイ
    return null;
  }
}

/**
 * ファイルパスがパターンにマッチするかチェック
 */
function matchesPattern(filePath, pattern) {
  if (typeof pattern === "string") {
    // Glob パターンを正規表現に変換
    // **を先にプレースホルダーに置き換えて、*の置換から保護する
    const regexPattern = pattern
      .replace(/\./g, "\\.")
      .replace(/\*\*/g, "__GLOBSTAR__")
      .replace(/\*/g, "[^/]*")
      .replace(/__GLOBSTAR__/g, ".*");
    return new RegExp(`^${regexPattern}$`).test(filePath);
  }
  return pattern.test(filePath);
}

/**
 * Check if package.json changes are only version bumps
 */
function isPackageJsonVersionOnly(filePath) {
  try {
    // Get package.json content before and after
    const beforeContent = execSync(`git show ${BEFORE_COMMIT}:${filePath}`, {
      encoding: "utf8",
    });
    const afterContent = execSync(`git show ${AFTER_COMMIT}:${filePath}`, {
      encoding: "utf8",
    });

    const beforePkg = JSON.parse(beforeContent);
    const afterPkg = JSON.parse(afterContent);

    // Fields that trigger a deployment if changed
    const importantFields = [
      "dependencies",
      "devDependencies",
      "peerDependencies",
      "scripts",
      "engines",
      "main",
      "type",
      "exports",
      "workspaces",
    ];

    for (const field of importantFields) {
      if (
        JSON.stringify(beforePkg[field]) !== JSON.stringify(afterPkg[field])
      ) {
        console.error(`  Change detected in '${field}' of ${filePath}`);
        return false; // Real change detected
      }
    }

    return true; // Safe to ignore (version bump only)
  } catch (error) {
    console.error(`Failed to check ${filePath} changes:`, error.message);
    return false; // Assume unsafe on error
  }
}

/**
 * `backend/package.json`内の必須パッケージ依存関係の変更を検出します。
 *
 * この関数は、`isPackageJsonVersionOnly`によってバージョンアップのみの変更が
 * 事前に除外されたファイルリストを対象とすることを前提としています。
 * `backend/package.json`がこのリストに含まれている場合、この関数は指定された
 * `requiredPackages`のバージョンが変更されたかどうかを具体的にチェックします。
 */
function checkPackageJsonChanges(changedFiles, requiredPackages) {
  const packageJsonPath = "backend/package.json";

  if (!changedFiles.includes(packageJsonPath)) {
    return false;
  }

  if (requiredPackages.length === 0) {
    return false; // 依存パッケージがない関数は影響なし
  }

  // Pre-filtering already removed package.json if it was version-only.
  // If it's still here, it means something important changed OR we skipped pre-filtering for it.

  // Actually, let's rely on the generic check.
  // But wait, the existing function checks `requiredPackages` specific subsets.
  // If I update `backend/package.json` adding a dependency that is NOT in `requiredPackages`,
  // `isPackageJsonVersionOnly` returns FALSE (change detected), so file remains in list.
  // Then THIS function runs. It sees the file. It checks `requiredPackages`.
  // If the added dependency is NOT in `requiredPackages`, it returns FALSE.
  // So we skip deploy. This is CORRECT efficient behavior.

  // What if ONLY version changed?
  // `isPackageJsonVersionOnly` returns TRUE. File removed from list.
  // THIS function sees NO file. Returns FALSE.
  // So we skip deploy. This is CORRECT.

  // So we just need to keep this function as is, but use the filtered list.

  try {
    const beforeContent = execSync(
      `git show ${BEFORE_COMMIT}:${packageJsonPath}`,
      { encoding: "utf8" },
    );
    const afterContent = execSync(
      `git show ${AFTER_COMMIT}:${packageJsonPath}`,
      { encoding: "utf8" },
    );
    const beforePkg = JSON.parse(beforeContent);
    const afterPkg = JSON.parse(afterContent);

    const beforeDeps = beforePkg.dependencies || {};
    const afterDeps = afterPkg.dependencies || {};

    for (const pkg of requiredPackages) {
      if (beforeDeps[pkg] !== afterDeps[pkg]) {
        console.error(
          `Package ${pkg} changed: ${beforeDeps[pkg]} -> ${afterDeps[pkg]}`,
        );
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Failed to check package.json changes:", error.message);
    return true;
  }
}

/**
 * メイン処理
 */
function main() {
  const functionName = process.argv[2];

  if (!functionName || !FUNCTION_DEPENDENCIES[functionName]) {
    console.error(`Usage: node backend-filter.js <function-name>`);
    console.error(
      `Valid function names: ${Object.keys(FUNCTION_DEPENDENCIES).join(", ")}`,
    );
    process.exit(1);
  }

  const deps = FUNCTION_DEPENDENCIES[functionName];
  const changedFiles = getChangedFiles();

  if (changedFiles === null) {
    // Git diff エラー時は安全のためデプロイ
    console.log("true");
    return;
  }

  if (changedFiles.length === 0) {
    console.log("false");
    return;
  }

  // 0. Pre-filter package.json files (backend/shared)
  let filteredFiles = [...changedFiles];
  const pkgFilesToCheck = filteredFiles.filter((f) =>
    f.endsWith("package.json"),
  );

  for (const pkgFile of pkgFilesToCheck) {
    if (isPackageJsonVersionOnly(pkgFile)) {
      filteredFiles = filteredFiles.filter((f) => f !== pkgFile);
      console.error(`  Ignoring version-only change in ${pkgFile}`);
    }
  }

  // 無視するファイルを除外
  const relevantFiles = filteredFiles.filter((file) => {
    return !IGNORED_FILES.some((pattern) => matchesPattern(file, pattern));
  });

  console.error(`Checking ${functionName}...`);
  console.error(`Changed files (after filtering): ${relevantFiles.length}`);

  // 1. & 2. 関数固有のファイルとsharedディレクトリの変更をチェック
  const allPatterns = [...deps.files, ...deps.sharedDirs];
  for (const file of relevantFiles) {
    for (const pattern of allPatterns) {
      if (matchesPattern(file, pattern)) {
        console.error(`  ✓ Relevant file changed: ${file}`);
        console.log("true");
        return;
      }
    }
  }

  // 3. package.json の dependencies の変更をチェック (backend/package.json only)
  // Note: if backend/package.json was version-only change, it is already removed from relevantFiles.
  if (checkPackageJsonChanges(relevantFiles, deps.packages)) {
    console.error(`  ✓ Required package changed`);
    console.log("true");
    return;
  }

  console.error(`  ✗ No relevant changes for ${functionName}`);
  console.log("false");
}

main();
