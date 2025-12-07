import { Suspense } from "react";

import LandingPageContent from "@/components/LandingPageContent";

/**
 * トップページ（ランディングページ）のルートコンポーネント。
 *
 * `LandingPageContent` を `Suspense` でラップし、認証状態やクエリパラメータに依存する処理の非同期読み込み中のフォールバックを提供する。
 * 画面全体の背景色設定なども行う。
 */
export default function FitbitLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900" />}>
      <LandingPageContent />
    </Suspense>
  );
}
