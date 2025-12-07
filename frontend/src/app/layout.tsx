import "./globals.css";

import Link from "next/link";

import HeaderMenu from "@/components/HeaderMenu";
import { getHeaderColor } from "@/utils/environment";

import { FirebaseAuthProvider } from "./auth/FirebaseAuthProvider";

export const metadata = {
  title: "Smart Food Logger AI",
  description: "AIで食事を分析してFitbitに記録",
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
        <FirebaseAuthProvider>
          <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100">
            <header className={`p-4 border-b border-gray-700 ${headerBgClass}`}>
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/">
                  <h1 className="text-xl font-bold">Smart Food Logger AI</h1>
                </Link>
                <HeaderMenu />
              </div>
            </header>
            <main className="grow container mx-auto p-8">{children}</main>
            <footer className="p-4 text-center text-xs text-gray-500 border-t border-gray-700">
              <div className="flex justify-center gap-4 mb-2">
                <Link
                  href="/terms"
                  className="text-gray-400 hover:text-gray-200"
                >
                  利用規約
                </Link>
                <Link
                  href="/privacy"
                  className="text-gray-400 hover:text-gray-200"
                >
                  プライバシーポリシー
                </Link>
              </div>
              <p>© {new Date().getFullYear()} vivviv. All rights reserved.</p>
            </footer>
          </div>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
