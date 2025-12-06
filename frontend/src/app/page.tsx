"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReCAPTCHAProps } from "react-google-recaptcha";

const ReCAPTCHA = dynamic<ReCAPTCHAProps>(
  () => import("react-google-recaptcha").then((mod) => mod.default),
  {
    ssr: false,
  },
);

import HowItWorksCarousel from "@/components/HowItWorksCarousel";

import { useFirebaseAuth } from "./auth/FirebaseAuthProvider";
import { app } from "./auth/firebaseConfig";

export default function FitbitLandingPage() {
  const { user, loading } = useFirebaseAuth();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaStatus, setRecaptchaStatus] = useState<
    "idle" | "success" | "collapsing"
  >("idle");
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // ページロード後に認証コンポーネントを表示（LCP優先のため）
    const timer = setTimeout(() => {
      setIsAuthReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (recaptchaToken) {
      setTimeout(() => {
        setRecaptchaStatus("success");
      }, 0);
      const timer = setTimeout(() => {
        setRecaptchaStatus("collapsing");
      }, 1000); // 1秒後に縮小アニメーション開始
      return () => clearTimeout(timer);
    }
  }, [recaptchaToken]);

  const handleAnonymousSignIn = async () => {
    if (!recaptchaToken) {
      alert("reCAPTCHAを完了してください。");
      return;
    }
    try {
      const { getAuth, signInAnonymously } = await import("firebase/auth");
      const auth = getAuth(app);
      await signInAnonymously(auth);
      // 匿名認証成功後、Fitbit認証フローを開始するためにoauthページへ遷移
      router.push("/oauth");
    } catch (error) {
      console.error("匿名認証エラー:", error);
      console.log("TODO: Implement toast notification for user feedback");
      alert("匿名認証に失敗しました。再度お試しください。");
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fitbitAuthCompleted");
    }
    const { getAuth, signOut } = await import("firebase/auth");
    const auth = getAuth();
    await signOut(auth);
    // You might want to reload the page or push to a logged-out state
    window.location.reload(); // Easiest way to reset state
  };

  const isAuthenticated =
    !loading &&
    user &&
    typeof window !== "undefined" &&
    localStorage.getItem("fitbitAuthCompleted") === "true";

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-teal-500">
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
                      <Link href="/register" passHref>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                          食事の記録を登録する
                        </button>
                      </Link>
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
                    <div
                      data-testid="recaptcha-container"
                      className={`flex justify-center items-center transition-all duration-500 ease-in-out ${
                        recaptchaStatus === "collapsing" ? "h-0" : "h-[78px]"
                      }`}
                    >
                      {recaptchaStatus === "idle" && (
                        <ReCAPTCHA
                          sitekey={
                            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
                          }
                          onChange={(token: string | null) =>
                            setRecaptchaToken(token)
                          }
                          theme="dark"
                        />
                      )}
                      {(recaptchaStatus === "success" ||
                        recaptchaStatus === "collapsing") && (
                        <p className="text-green-400">
                          ✓ reCAPTCHA認証が完了しました
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 max-w-xs text-center">
                      ボタンを押すと、サービス利用のための一時的なIDが発行され、Fitbitの連携ページに移動します。
                    </p>
                    <button
                      onClick={handleAnonymousSignIn}
                      disabled={!recaptchaToken}
                      className={`font-bold py-3 px-6 rounded-lg transition-colors ${
                        recaptchaToken
                          ? "bg-green-500 hover:bg-green-700 text-white"
                          : "bg-gray-400 text-gray-700 cursor-not-allowed"
                      }`}
                    >
                      利用を開始する
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
