#!/bin/bash

# netlify-ignore.sh
# Determines whether a Netlify build should proceed based on changed files.
# Exits with 1 to trigger a build, 0 to skip it.

# Debug: Print environment variables
echo "Context: $CONTEXT"
echo "Commit Ref: $COMMIT_REF"
echo "Cached Commit Ref: $CACHED_COMMIT_REF"

# Default comparison range (for production/branch deploys)
BASE_REF="$CACHED_COMMIT_REF"
HEAD_REF="$COMMIT_REF"
DIFF_CMD="git diff --name-only $BASE_REF $HEAD_REF"

# For Deploy Previews (Pull Requests), compare against the base branch (develop)
# This prevents changes from previous PRs (merged into the base) from triggering builds
if [ "$CONTEXT" == "deploy-preview" ]; then
  echo "Deploy Preview detected. Fetching origin/develop..."

  # Optimization: Only fetch the tip of develop (depth=1) to keep it fast.
  # We use 2-dot diff (FETCH_HEAD HEAD) instead of 3-dot diff to avoid needing the full history for merge-base.
  # Note: This might cause false positives (triggering builds) if develop has new frontend changes
  # that are not in the PR yet, but this is safer and faster than deep fetching.
  if ! git fetch origin develop --depth=1 2>/dev/null; then
    echo "Failed to fetch origin/develop. Forcing build for safety."
    exit 1
  fi

  # FETCH_HEAD points to origin/develop tip
  BASE_REF="FETCH_HEAD"
  HEAD_REF="HEAD"

  # Use 2-dot diff (space separated)
  DIFF_CMD="git diff --name-only $BASE_REF $HEAD_REF"
  echo "Comparing $BASE_REF...$HEAD_REF (using 2-dot diff for performance)"
else
  # Fallback: if CACHED_COMMIT_REF is empty (first build), force build
  if [ -z "$CACHED_COMMIT_REF" ]; then
    echo "No cached commit ref found. Forcing build."
    exit 1
  fi
  echo "Comparing $BASE_REF $HEAD_REF"
fi

# Get list of changed files
# If git diff fails, force a build (fail-safe)
if ! CHANGED_FILES=$(eval "$DIFF_CMD"); then
  echo "Git diff failed. Forcing build for safety."
  exit 1
fi

# If no changes detected
if [ -z "$CHANGED_FILES" ]; then
  echo "No changes detected."
  exit 0
fi

echo "Changed files:"
echo "$CHANGED_FILES"

# Filter logic
# 1. We only care about changes in these directories/files:
# Include netlify.toml and scripts/ to ensure config/build logic changes trigger builds.
SIGNIFICANT_PATTERN="^(frontend/|shared/|package\.json|pnpm-lock\.yaml|netlify\.toml|scripts/)"

# 2. But we explicitly ignore these sub-paths/files even if they match above:
IGNORE_PATTERN="^(frontend/test/|shared/test/|.*\.md$|frontend/\.env\.local\.example|frontend/vitest\.config\.ts|frontend/playwright\.config\.ts|shared/vitest\.config\.ts)"

# Check if any changed file matches SIGNIFICANT_PATTERN AND does NOT match IGNORE_PATTERN
RELEVANT_CHANGES=$(echo "$CHANGED_FILES" | grep -E "$SIGNIFICANT_PATTERN" | grep -vE "$IGNORE_PATTERN")

if [ -n "$RELEVANT_CHANGES" ]; then
  echo "Build triggered by changes in:"
  echo "$RELEVANT_CHANGES"
  exit 1
else
  echo "No relevant changes found. Skipping build."
  exit 0
fi
