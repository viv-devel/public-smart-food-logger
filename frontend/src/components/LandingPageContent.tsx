"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";
import { app } from "@/app/auth/firebaseConfig";
import HowItWorksCarousel from "@/components/HowItWorksCarousel";
import RedirectModal from "@/components/RedirectModal";
import { useRecaptcha } from "@/hooks/useRecaptcha";

/**
 * ランディングページのメインコンテンツコンポーネント。
 *
 * 認証フロー、サービス紹介（カルーセル）、およびFitbit連携への導線を一元管理する。
 * `Suspense`境界内で使用されることを想定しており、動的インポートやクライアントサイドのフックを多用する。
 *
 * 主な責務:
 * - **認証フロー管理**: 匿名認証、reCAPTCHA検証、Fitbit OAuthへのリダイレクト。
 * - **リダイレクト制御**: `RedirectModal`を使用したユーザーへの確認と設定の永続化。
 * - **UI表示**: ヒーローセクション、機能紹介カルーセル、認証状態に応じたボタンの表示切り替え。
 */
export default function LandingPageContent() {
  const { user, loading } = useFirebaseAuth();
  const { executeRecaptcha, verifyWithBackend } = useRecaptcha();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Modal states
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [rememberRedirect, setRememberRedirect] = useState(() => {
    if (typeof window !== "undefined") {
      // クライアントサイドでのみ localStorage の値を初期値として読み込む
      return localStorage.getItem("redirectRemembered") === "true";
    }
    // サーバーサイドでは false を返す（SSRセーフ）
    return false;
  });

  const [showAuthSuccessMessage, setShowAuthSuccessMessage] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success session flag on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const showSuccess = sessionStorage.getItem("showAuthSuccessModal");
      if (showSuccess === "true") {
        setShowAuthSuccessMessage(true);
        sessionStorage.removeItem("showAuthSuccessModal");
      }
    }
  }, []);

  useEffect(() => {
    const isAuth =
      !loading &&
      user &&
      localStorage.getItem("fitbitAuthCompleted") === "true";
    setIsAuthenticated(!!isAuth);
  }, [loading, user]);

  useEffect(() => {
    // ページロード後に認証コンポーネントを表示（LCP優先のため）
    const timer = setTimeout(() => {
      setIsAuthReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Automatically open modal if success message is present, OR if remembered redirect
  useEffect(() => {
    // ?show_top=true が指定されている場合は自動リダイレクトをスキップ
    const showTop = searchParams.get("show_top") === "true";
    if (showTop) return;

    if (isAuthenticated) {
      if (showAuthSuccessMessage) {
        setShowRedirectModal(true);
      } else if (rememberRedirect) {
        router.push("/register");
      }
    }
  }, [
    isAuthenticated,
    showAuthSuccessMessage,
    rememberRedirect,
    router,
    searchParams,
  ]);

  const handleStartFlow = () => {
    if (rememberRedirect) {
      router.push("/register");
    } else {
      setShowRedirectModal(true);
    }
  };

  const handleConfirmRedirect = () => {
    // rememberRedirect は既に RedirectModal からの setRememberRedirect 呼び出しで更新されている
    if (rememberRedirect) {
      localStorage.setItem("redirectRemembered", "true");
    } else {
      // ユーザーがチェックを外した場合、永続化された設定もクリアする
      localStorage.removeItem("redirectRemembered");
    }
    setShowRedirectModal(false);
    router.push("/register");
  };

  const handleAnonymousSignIn = async (): Promise<boolean> => {
    try {
      const { getAuth, signInAnonymously } = await import("firebase/auth");
      const auth = getAuth(app);
      await signInAnonymously(auth);
      // 匿名認証成功後、Fitbit認証フローを開始するためにoauthページへ遷移
      router.push("/oauth");
      return true;
    } catch (error) {
      console.error("匿名認証エラー:", error);
      console.log("TODO: Implement toast notification for user feedback");
      alert("匿名認証に失敗しました。再度お試しください。");
      return false;
    }
  };

  const handleStartVerification = async () => {
    setIsVerifying(true);
    try {
      // 1. reCAPTCHA v3 トークンの取得
      const token = await executeRecaptcha("AUTHENTICATE");

      // 2. バックエンドでの検証
      const isValid = await verifyWithBackend(token, "AUTHENTICATE");

      if (isValid) {
        // 3. 検証成功 -> 匿名認証フローへ
        const authSuccess = await handleAnonymousSignIn();
        // 認証失敗時はボタンの状態をリセット
        if (!authSuccess) {
          setIsVerifying(false);
        }
      } else {
        alert(
          "セキュリティチェックに失敗しました。ページをリロードして再度お試しください。",
        );
        setIsVerifying(false);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      alert("エラーが発生しました。再度お試しください。");
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fitbitAuthCompleted");
      localStorage.removeItem("redirectRemembered");
    }
    try {
      const { getAuth, signOut } = await import("firebase/auth");
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
    // You might want to reload the page or push to a logged-out state
    window.location.reload(); // Easiest way to reset state
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <RedirectModal
        isOpen={showRedirectModal}
        onClose={() => setShowRedirectModal(false)}
        onConfirm={handleConfirmRedirect}
        remember={rememberRedirect}
        setRemember={setRememberRedirect}
        showSuccessMessage={showAuthSuccessMessage}
      />
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-500"
            data-testid="landing-title"
          >
            Smart Food Logger AI
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            食べたものをAIが解析し、Fitbitへ自動記録。
            <br />
            <span className="font-bold text-teal-400">
              食事データはFitbitにのみ記録され、このサイトには残りません。
            </span>
          </p>

          <div className="my-12 relative py-8">
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-700 to-transparent"></div>
            <HowItWorksCarousel />
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-700 to-transparent"></div>
          </div>

          <div className="flex flex-col items-center gap-6 min-h-[300px]">
            {/* 認証関連コンポーネントの遅延ロード */}
            {isAuthReady ? (
              <>
                <Link href="/instructions" passHref>
                  <button className="bg-transparent hover:bg-gray-800 text-gray-300 font-bold py-3 px-6 rounded-lg border border-gray-600 transition-colors duration-300">
                    設定手順を見る
                  </button>
                </Link>

                {/* Conditional rendering for auth buttons */}
                {loading ? (
                  <p>認証状態を確認中...</p>
                ) : isAuthenticated ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-4">
                      {/* handleStartFlow handles the redirect logic now */}
                      <button
                        onClick={handleStartFlow}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        食事の記録を登録する
                      </button>
                      <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                      >
                        Fitbit連携を解除
                      </button>
                    </div>
                    <p className="text-green-400 text-sm">Fitbit連携済み</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 max-w-xs text-center">
                      ボタンを押すと、サービス利用のための一時的なIDが発行され、Fitbitの連携ページに移動します。
                    </p>
                    <button
                      onClick={handleStartVerification}
                      disabled={isVerifying}
                      className={`font-bold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 ${
                        isVerifying
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-700 text-white"
                      }`}
                    >
                      {isVerifying ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          検証中...
                        </>
                      ) : (
                        "利用を開始する"
                      )}
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="min-h-[300px]" /> /* プレースホルダー */
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
