import "./globals.css";

import Link from "next/link";

import { Footer } from "@/components/Footer";
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
            <Footer />
          </div>
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
