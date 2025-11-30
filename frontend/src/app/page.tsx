"use client";

import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import dynamic from "next/dynamic";
import Image from "next/image";
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

import { useFirebaseAuth } from "./auth/FirebaseAuthProvider";
import { app } from "./auth/firebaseConfig";

export default function FitbitLandingPage() {
  const { user, loading } = useFirebaseAuth();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaStatus, setRecaptchaStatus] = useState<
    "idle" | "success" | "collapsing"
  >("idle");
  const router = useRouter();

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
      const auth = getAuth(app);
      await signInAnonymously(auth);
      // 匿名認証成功後、Fitbit認証フローを開始するためにoauthページへ遷移
      router.push("/oauth");
    } catch (error) {
      console.error("匿名認証エラー:", error);
      alert("匿名認証に失敗しました。再度お試しください。");
    }
  };

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("fitbitAuthCompleted");
    }
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
          <div className="flex flex-col items-center gap-6">
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
                      sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
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
          </div>
        </div>

        <div className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col">
              <div className="text-3xl mb-4">1.</div>
              <h3 className="text-xl font-semibold mb-2">食事の写真を送る</h3>
              <p className="text-gray-400 grow">
                専用のカスタムGeminiに食事の写真を送ると、AIが自動で栄養情報を分析します。
              </p>
              <div className="mt-4 relative w-full h-40">
                <Image
                  src="/images/smart-food-logger-step1.png"
                  alt="Step 1: 食事の写真を送る"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col">
              <div className="text-3xl mb-4">2.</div>
              <h3 className="text-xl font-semibold mb-2">JSONをコピー</h3>
              <p className="text-gray-400 grow">
                Geminiが出力した栄養情報（JSON形式）をクリップボードにコピーします。
              </p>
              <div className="mt-4 relative w-full h-40">
                <Image
                  src="/images/smart-food-logger-step2.png"
                  alt="Step 2: JSONをコピー"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg flex flex-col">
              <div className="text-3xl mb-4">3.</div>
              <h3 className="text-xl font-semibold mb-2">貼り付けて記録</h3>
              <p className="text-gray-400 grow">
                このサイトの記録ページにJSONを貼り付け、ボタンを押すだけでFitbitに記録が完了します。
              </p>
              <div className="mt-4 relative w-full h-40">
                <Image
                  src="/images/smart-food-logger-step3.png"
                  alt="Step 3: 貼り付けて記録"
                  fill
                  style={{ objectFit: "cover" }}
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
