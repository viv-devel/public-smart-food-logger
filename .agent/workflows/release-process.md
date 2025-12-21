---
description: Create a release PR, wait for merge, and synchronize develop (Reset Model)
---

1. Create Release PR
   // turbo
   gh pr create --base main --head develop --title "Release" --body "Release PR from develop to main"

2. Request Review
   // turbo
   gh pr comment develop --body "@gemini-code-assist /review @coderabbitai review これはリリースPRです。重大な問題のみ指摘してください。細かい修正は別途対応します。"

3. Squash Merge the PR
   **IMPORTANT**: Before merging, check the PR title and body. Ensure that strings like `[skip ci]` or `[skip netlify]` are **removed** from the final squash commit message.

   **ACTION REQUIRED**: Explicitly ask the user for confirmation to proceed with the merge command below.

   gh pr merge develop --squash

4. Fetch latest changes from remote
   // turbo
   git fetch origin

5. Verify consistency (diff check)
   // turbo
   git diff --stat origin/develop origin/main

   > **Check**: The output should be empty or show no significant content differences designated for release.
   > Since we just merged develop into main, they should be content-identical.

6. Checkout develop branch
   // turbo
   git checkout develop

7. (安全チェック) developブランチに未マージのコミットがないか確認
   // turbo
   git log origin/main..origin/develop

   > **チェック**: このコマンドの出力は空でなければなりません。もし何か表示された場合、リリース開始後に新しいコミットが `develop` にプッシュされたことを意味します。データ損失を避けるため、処理を**停止**して原因を調査してください。

8. Reset develop to match main (Reset Model)
   // turbo
   git reset --hard origin/main

9. Force push synchronized develop
   // turbo
   git push origin develop --force
