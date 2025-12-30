ARG BASE_IMAGE=asia-northeast1-docker.pkg.dev/gemini-fitbit-dev-2025/gcf-artifacts/backend-base:latest
FROM ${BASE_IMAGE}

WORKDIR /app

# ビルド済み成果物をコピー
COPY dist ./dist
COPY package.json ./

# エントリーポイント（Cloud Functionsが使用）
CMD ["npx", "@google-cloud/functions-framework", "--target=${FUNCTION_TARGET}"]
