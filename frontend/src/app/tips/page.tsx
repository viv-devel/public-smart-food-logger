import Link from "next/link";

import { AppLinks } from "@/components/AppLinks";

export default function TipsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">活用ヒント</h1>
      <p className="text-center text-gray-400 mb-10">
        よりスムーズに食事を記録するための便利な使い方をご紹介します。
      </p>

      <div className="space-y-8">
        <AppLinks />
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          アプリに戻る
        </Link>
      </div>
    </div>
  );
}
