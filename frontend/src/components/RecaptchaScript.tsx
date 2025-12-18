"use client";

import Script from "next/script";

/**
 * Google reCAPTCHA v3 スクリプトを読み込むためのコンポーネント。
 *
 * このコンポーネントがマウントされると、`next/script` を使用して Google のサーバーから
 * reCAPTCHA のスクリプト (`api.js`) を読み込みます。
 *
 * @example
 * ```tsx
 * // ページコンポーネント内などで使用
 * <RecaptchaScript />
 * ```
 */
export default function RecaptchaScript() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;

  if (!siteKey) {
    console.warn("NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY is not set.");
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
    />
  );
}
