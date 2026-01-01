---
description: Create a release PR, wait for merge, and synchronize develop (Reset Model)
---

1. Check Versions
   **IMPORTANT**: Ensure both `backend/package.json` and `frontend/package.json` have the correct release version (e.g., `1.0.0`).
   **RULE**: Production releases MUST have a unique version number. Do not release the same version twice.

   // turbo
   cat backend/package.json
   // turbo
   cat frontend/package.json

2. Create Release PR
   // turbo
   gh pr create --base main --head develop --title "Release v1.0.0" --body "Release PR from develop to main"

3. Request Review
   // turbo
   gh pr comment develop --body "@gemini-code-assist /review @coderabbitai review This is a release PR. Please verify version numbers and critical changes only."

4. Squash Merge the PR
   **IMPORTANT**: Before merging, check the PR title and body. Ensure that strings like `[skip ci]` or `[skip netlify]` are **removed** from the final squash commit message.

   **ACTION REQUIRED**: Explicitly ask the user for confirmation to proceed with the merge command below.

   gh pr merge develop --squash

5. Create and Push Git Tag
   **IMPORTANT**: Execute this AFTER the merge is complete. Replace `v1.0.0` with the actual version number.

   git tag v1.0.0
   git push origin v1.0.0

6. Monitor Deployment & Approve Backend
   **Frontend**: Netlify will automatically build and deploy. Monitor the status.
   **Backend**:
   - Go to GitHub Actions tab.
   - Look for the `CD - Backend` workflow triggered by the merge to `main`.
   - **WAIT**: The `build_base` job (or `build`) will pause for **Approval**.
   - **ACTION**: Manually approve the deployment to the `production` environment.

7. Fetch latest changes from remote
   // turbo
   git fetch origin

8. Verify consistency (diff check)
   // turbo
   git diff --stat origin/develop origin/main

   > **Check**: The output should be empty or show no significant content differences designated for release.
   > Since we just merged develop into main, they should be content-identical.

9. Checkout develop branch
   // turbo
   git checkout develop

10. (Safety Check) Verify no unmerged commits on develop
    // turbo
    git log origin/main..origin/develop

> **Check**: This output MUST be empty. If anything is shown, it means new commits were pushed to `develop` during the release. STOP and investigate.

11. Reset develop to match main (Reset Model)
    // turbo
    git reset --hard origin/main

12. Force push synchronized develop
    // turbo
    git push origin develop --force
