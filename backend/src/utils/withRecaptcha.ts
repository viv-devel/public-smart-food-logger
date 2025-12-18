import type { HttpFunction } from "@google-cloud/functions-framework";

import { RECAPTCHA_THRESHOLDS, verifyRecaptcha } from "../recaptcha.js";

/**
 * reCAPTCHA検証を行う高階関数（ラッパー）
 *
 * @param action 検証するアクション名 ('AUTHENTICATE' | 'WRITE_LOG')
 * @param handler 元のハンドラー関数
 * @returns ラップされたHttpFunction
 */
export const withRecaptcha = (
  action: "AUTHENTICATE" | "WRITE_LOG",
  handler: HttpFunction,
): HttpFunction => {
  return async (req, res) => {
    // リクエストボディからトークンを取得（後方互換性のため）
    const token = req.body?.recaptchaToken;

    // トークンが存在しない場合は検証をスキップして元のハンドラーを実行
    if (!token) {
      // 後方互換性のため、ログには残すが処理は続行
      console.log(
        JSON.stringify({
          severity: "INFO",
          component: "recaptcha",
          message: "No reCAPTCHA token provided, skipping verification.",
          action,
        }),
      );
      return handler(req, res);
    }

    // 閾値の決定（定数定義を使用）
    const threshold = RECAPTCHA_THRESHOLDS[action] || 0.3;

    // 検証実行
    const isValid = await verifyRecaptcha(token, action, threshold);

    if (!isValid) {
      console.warn(`reCAPTCHA verification failed for action: ${action}`);
      res.status(403).json({
        error: "Forbidden: reCAPTCHA verification failed.",
      });
      return;
    }

    // 検証成功時は元のハンドラーを実行
    return handler(req, res);
  };
};
