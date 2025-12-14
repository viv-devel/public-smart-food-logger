---
description: Create a release PR, wait for merge, and synchronize develop (Reset Model)
---

1. Create Release PR
   // turbo
   gh pr create --base main --head develop --title "Release" --body "Release PR from develop to main"

2. (Manual) Squash Merge the PR on GitHub
   **STOP**: Go to GitHub and merge the PR created in the previous step.
   **Note**: Ensure you use "Squash Merge".
   Do not proceed to the next step until the merge is complete.

3. Fetch latest changes from remote
   // turbo
   git fetch origin

4. Verify consistency (diff check)
   // turbo
   git diff --stat origin/develop origin/main

   > **Check**: The output should be empty or show no significant content differences designated for release.
   > Since we just merged develop into main, they should be content-identical.

5. Checkout develop branch
   // turbo
   git checkout develop

6. Reset develop to match main (Reset Model)
   // turbo
   git reset --hard origin/main

7. Force push synchronized develop
   // turbo
   git push origin develop --force
