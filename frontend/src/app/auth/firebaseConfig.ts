// src/app/fitbit-via-gemini/auth/firebaseConfig.ts
import { getApps, initializeApp } from "firebase/app";

/**
 * Firebaseプロジェクトの設定オブジェクト。
 * 各キーは.env.localファイルなどの環境変数から取得される。
 * @see https://firebase.google.com/docs/web/setup#config-object
 */
// ご自身のFirebaseプロジェクトの設定に置き換えてください
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

/**
 * Firebase Appインスタンスを初期化または取得する。
 *
 * `getApps()` で既存のAppインスタンスのリストを確認し、
 * 存在しない場合（リストが空の場合）のみ `initializeApp(firebaseConfig)` を呼び出す。
 * これにより、サーバーサイドレンダリングやホットリロード時などに
 * Appが複数回初期化されることによるエラーを防ぐ（シングルトンパターン）。
 *
 * @see https://firebase.google.com/docs/web/setup#initialize-firebase-in-your-app
 */
// Firebaseアプリが初期化されていない場合のみ初期化
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export { app };
