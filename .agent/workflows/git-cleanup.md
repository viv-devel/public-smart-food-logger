---
description: Update develop branch and clean up merged branches
---

1. Fetch latest changes from remote
   // turbo
   git fetch --all --prune

2. Switch to develop branch
   // turbo
   git checkout develop

3. Pull latest changes for develop
   // turbo
   git pull origin develop

4. List branches merged into develop (candidates for deletion)
   // turbo
   git branch --merged develop

5. (Manual) Delete a specific merged branch if desired
   git branch -d <branch_name>
