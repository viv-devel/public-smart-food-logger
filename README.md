# Smart Food Logger

[![Build Status](https://github.com/viv-devel/public-smart-food-logger/actions/workflows/deploy-coverage.yaml/badge.svg?branch=develop)](https://github.com/viv-devel/public-smart-food-logger/actions/workflows/deploy-coverage.yaml)
[![CodeFactor](https://www.codefactor.io/repository/github/viv-devel/public-smart-food-logger/badge)](https://www.codefactor.io/repository/github/viv-devel/public-smart-food-logger)
[![License](https://img.shields.io/github/license/viv-devel/public-smart-food-logger)](LICENSE)
[![Coverage](https://img.shields.io/endpoint?url=https://viv-devel.github.io/public-smart-food-logger/coverage.json)](https://viv-devel.github.io/public-smart-food-logger/)

**Smart Food Logger** は、食事の写真を AI (Gemini) で解析し、栄養情報を自動で Fitbit に記録するアプリケーションです。

> **Note**: このプロジェクトは、Google Gemini および Claude Sonnet の支援を受けて開発されました。

## 特徴

- **AI 解析**: 食事の写真を解析し、カロリーや栄養素を推定します。
  - **Note**: 解析にはユーザー自身が作成するカスタム Gem を使用します。AI の利用枠（レート制限など）はユーザー自身のアカウントのものが適用され、開発者の枠は消費しません。
- **Fitbit 連携**: 食事データを Fitbit アカウントにシームレスに記録します。
- **プライバシー重視**: 食事データは Fitbit に直接記録され、このサービス上には永続的に保存されません。
- **モダンな技術スタック**: Next.js, Firebase, Google Cloud Functions で構築されています。

## アーキテクチャ

このプロジェクトは `pnpm workspaces` で管理される **Monorepo** 構成です。

- **`frontend/`**: Vercel/Netlify でホストされる Next.js アプリケーション (App Router) です。UI、Firebase 認証 (匿名認証)、Fitbit OAuth フローを担当します。
- **`backend/`**: Google Cloud Functions (Node.js) です。Fitbit API とのセキュアな通信や Webhook 処理を担当します。
- **`shared/`**: フロントエンドとバックエンドの両方で使用される共有の TypeScript 型定義やユーティリティです。

## 技術スタック

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Firebase Auth
- **Backend**: Node.js, Google Cloud Functions, Firestore
- **Package Manager**: pnpm

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルをご確認ください。
