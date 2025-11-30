import "./globals.css";

import Link from "next/link";

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
  const environment = process.env.ENVIRONMENT;
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
                <nav className="flex gap-4">
                  <Link
                    href="/terms"
                    className="text-sm text-gray-400 hover:text-gray-200"
                  >
                    利用規約
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-sm text-gray-400 hover:text-gray-200"
                  >
                    プライバシーポリシー
                  </Link>
                  <Link
                    href={
                      process.env.NEXT_PUBLIC_PORTAL_URL ||
                      "http://localhost:3000"
                    }
                    className="text-sm text-gray-400 hover:text-gray-200"
                  >
                    ↑ Hubへ戻る
                  </Link>
                </nav>
              </div>
            </header>
            <main className="grow container mx-auto p-8">{children}</main>
            <footer className="p-4 text-center text-xs text-gray-500 border-t border-gray-700">
              <p>© {new Date().getFullYear()} vivviv. All rights reserved.</p>
            </footer>
          </div>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
