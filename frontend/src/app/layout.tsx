import "./globals.css";

import Link from "next/link";

import { Footer } from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import { ToastProvider } from "@/components/Toast";
import { getHeaderColor } from "@/utils/environment";

import { FirebaseAuthProvider } from "./auth/FirebaseAuthProvider";

// メタデータ定数（SNSシェア用）
const SITE_TITLE =
  "Smart Food Logger | 写真からFitbitへの食事記録をAIがサポート";
const SITE_DESCRIPTION =
  "食事の写真を撮るだけでAIが内容を推定。記録の手間を最小限にして、Fitbitへ簡単に反映できます。Pixel Watchで消費と摂取をバランスよく管理したい方に。";
const OG_IMAGE = "/images/1-photo-analysis.webp";

/**
 * 環境変数からベースURLを取得する
 * Netlifyの組み込み環境変数 URL を使用し、未定義の場合はローカルホストにフォールバック
 * @see https://docs.netlify.com/configure-builds/environment-variables/#read-only-variables
 */
const getBaseUrl = (): string => {
  // Netlifyの環境変数 URL は、デプロイコンテキストに応じて適切なベースURLを返す
  // Production、Staging、Deploy Preview環境で自動設定される
  // CI/ローカル環境では未定義のためフォールバックを使用
  const siteUrl = process.env.URL;
  if (siteUrl) {
    try {
      // URLの妥当性を検証
      new URL(siteUrl);
      return siteUrl;
    } catch (error) {
      console.error("Invalid site URL:", siteUrl, error);
    }
  }

  // フォールバック: ローカル開発環境およびCI環境
  return "http://localhost:3000";
};

// metadataBase の構築をエラーハンドリング付きで実行
let metadataBase: URL;
try {
  metadataBase = new URL(getBaseUrl());
} catch (error) {
  console.error("Failed to create metadataBase URL:", error);
  metadataBase = new URL("http://localhost:3000");
}

export const metadata = {
  metadataBase,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const environment = process.env.APP_ENVIRONMENT;
  const headerBgClass = getHeaderColor(environment);

  return (
    <html lang="ja">
      <body>
        {/* Preconnect hints for critical third-party domains to improve initial load performance */}
        {/* Next.js will hoist these to the <head> */}
        <link rel="preconnect" href="https://apis.google.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <FirebaseAuthProvider>
          <ToastProvider>
            <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
              <header
                className={`p-4 border-b border-gray-700 ${headerBgClass}`}
              >
                <div className="container mx-auto flex justify-between items-center">
                  <Link href="/?show_top=true">
                    <h1 className="text-xl font-bold">Smart Food Logger AI</h1>
                  </Link>
                  <HeaderMenu />
                </div>
              </header>
              <main className="grow container mx-auto p-8">{children}</main>
              <Footer />
            </div>
          </ToastProvider>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
