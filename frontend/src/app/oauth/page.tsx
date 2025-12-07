"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { useFirebaseAuth } from "../auth/FirebaseAuthProvider";

/**
 * Fitbit OAuth認証フローの制御コンポーネント。
 *
 * このページは以下の2つの役割を持つ:
 * 1. **認証開始**: 未認証状態の場合、Fitbitの認証サーバーへリダイレクトURLを構築して遷移させる。
 * 2. **コールバック受信**: バックエンドでの認証完了後、リダイレクトされて戻ってきた際の成功パラメータ (`uid`) を検知し、認証完了フラグをローカルストレージに保存してトップページへ戻す。
 *
 * 注意:
 * - `Suspense` でラップされており、クライアントサイドでの動的なクエリパラメータ取得 (`useSearchParams`) に対応している。
 */
function FitbitOAuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useFirebaseAuth();

  useEffect(() => {
    // 認証コールバックからのリダイレクトを処理
    const uid = searchParams.get("uid");
    if (uid) {
      // コールバック成功。フラグを立ててメインページにリダイレクト
      localStorage.setItem("fitbitAuthCompleted", "true");
      // 認証完了メッセージ表示用のセッションフラグを設定
      sessionStorage.setItem("showAuthSuccessModal", "true");
      router.push("/");
      return; // これ以降の処理は不要
    }

    // Firebaseユーザーが読み込まれるまで待機
    if (loading) {
      return;
    }

    // Firebaseユーザーがいて、まだFitbit認証を開始していない場合に認証フローを開始
    if (user && !searchParams.has("code")) {
      const clientId = process.env.NEXT_PUBLIC_FITBIT_CLIENT_ID;
      if (!clientId) {
        throw new Error("NEXT_PUBLIC_FITBIT_CLIENT_ID is not defined.");
      }
      const backendRedirectUri =
        process.env.NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI;
      if (!backendRedirectUri) {
        throw new Error(
          "NEXT_PUBLIC_FITBIT_BACKEND_REDIRECT_URI is not defined.",
        );
      }
      const scope = "nutrition";
      const responseType = "code";

      // フロントエンドのこのページへのリダイレクトURI
      const finalRedirectUri =
        process.env.NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI;
      if (!finalRedirectUri) {
        throw new Error(
          "NEXT_PUBLIC_FITBIT_FRONTEND_REDIRECT_URI is not defined.",
        );
      }

      // stateオブジェクトにfirebaseUidと最終的なリダイレクト先を含める
      const state = {
        firebaseUid: user.uid,
        redirectUri: finalRedirectUri,
      };

      // stateをBase64エンコードしてURLに含める
      const encodedState = btoa(JSON.stringify(state));

      const fitbitAuthUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(backendRedirectUri)}&scope=${scope}&response_type=${responseType}&state=${encodeURIComponent(encodedState)}`;

      // Fitbit認証ページへリダイレクト
      window.location.href = fitbitAuthUrl;
    }
  }, [searchParams, router, user, loading]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold">Fitbit Authentication</h1>
      <p className="mt-4">Redirecting to Fitbit for authentication...</p>
      {loading && <p>Loading user data...</p>}
    </div>
  );
}

export default function FitbitOAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
          <h1 className="text-2xl font-bold">Fitbit Authentication</h1>
          <p className="mt-4">Processing authentication...</p>
        </div>
      }
    >
      <FitbitOAuthContent />
    </Suspense>
  );
}
