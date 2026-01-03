import "./globals.css";

import type { Metadata } from "next";
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
const OG_IMAGE = "/images/ogp-image.png";

/**
 * 環境変数からベースURLを取得する
 * Netlifyの組み込み環境変数 URL を使用し、未定義の場合はローカルホストにフォールバック
 * @see https://docs.netlify.com/configure-builds/environment-variables/#read-only-variables
 */
const getBaseUrl = (): URL => {
  // Netlifyの環境変数 URL は、デプロイコンテキストに応じて適切なベースURLを返す
  // Production、Staging、Deploy Preview環境で自動設定される
  // CI/ローカル環境では未定義のためフォールバックを使用
  const siteUrl = process.env.URL;
  if (siteUrl) {
    try {
      // URLの妥当性を検証して返す
      return new URL(siteUrl);
    } catch (error) {
      console.error("Invalid site URL:", siteUrl, error);
    }
  }

  // フォールバック: ローカル開発環境およびCI環境
  return new URL("http://localhost:3000");
};

// metadataBase を取得
const metadataBase = getBaseUrl();

export async function generateMetadata(): Promise<Metadata & { jsonLd?: any }> {
  const baseUrl = getBaseUrl();
  const siteUrlString = baseUrl.toString();

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Smart Food Logger",
    url: siteUrlString,
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Smart Food Logger",
    applicationCategory: "HealthApplication",
    operatingSystem: "Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    description: SITE_DESCRIPTION,
    author: {
      "@type": "Organization",
      name: "Smart Food Logger Team",
      url: siteUrlString,
    },
    screenshot: `${siteUrlString}images/ogp-image.png`.replace(
      /([^:]\/)\/+/g,
      "$1",
    ),
    featureList: [
      "食事検索や面倒な栄養計算・入力が一切不要",
      "写真やチャットでAIに伝えるだけの圧倒的に楽な記録体験",
      "生成されたJSONをコピペするだけのシンプル操作",
      "Fitbitへの自動連携（完全無料）",
    ],
  };

  return {
    metadataBase: baseUrl,
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
    jsonLd: [websiteSchema, softwareAppSchema],
  };
}

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
