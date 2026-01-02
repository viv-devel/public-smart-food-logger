import "./globals.css";

import Link from "next/link";

import { Footer } from "@/components/Footer";
import HeaderMenu from "@/components/HeaderMenu";
import { ToastProvider } from "@/components/Toast";
import { getHeaderColor } from "@/utils/environment";

import { FirebaseAuthProvider } from "./auth/FirebaseAuthProvider";

export const metadata = {
  title: "Smart Food Logger | 写真からFitbitへの食事記録をAIがサポート",
  description:
    "食事の写真を撮るだけでAIが内容を推定。記録の手間を最小限にして、Fitbitへ簡単に反映できます。Pixel Watchで消費と摂取をバランスよく管理したい方に。",
  openGraph: {
    type: "website",
    title: "Smart Food Logger | 写真からFitbitへの食事記録をAIがサポート",
    description:
      "食事の写真を撮るだけでAIが内容を推定。記録の手間を最小限にして、Fitbitへ簡単に反映できます。Pixel Watchで消費と摂取をバランスよく管理したい方に。",
    images: ["/images/1-photo-analysis.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Food Logger | 写真からFitbitへの食事記録をAIがサポート",
    description:
      "食事の写真を撮るだけでAIが内容を推定。記録の手間を最小限にして、Fitbitへ簡単に反映できます。Pixel Watchで消費と摂取をバランスよく管理したい方に。",
    images: ["/images/1-photo-analysis.webp"],
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
