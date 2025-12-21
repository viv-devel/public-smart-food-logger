import type { HttpFunction } from "@google-cloud/functions-framework";
import fetch from "node-fetch";

// アクションごとの閾値定義（一元管理）
export const RECAPTCHA_THRESHOLDS: Record<string, number> = {
  AUTHENTICATE: 0.3,
};

export const recaptchaVerifier: HttpFunction = async (req, res) => {
  // CORS configuration
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Max-Age", "3600");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  const { token, action } = req.body;

  if (!token) {
    res.status(400).json({ success: false, error: "reCAPTCHA token missing" });
    return;
  }

  const requestedAction = typeof action === "string" ? action : "";

  // アクションに基づく閾値の決定（デフォルトは0.3）
  const threshold = RECAPTCHA_THRESHOLDS[requestedAction] || 0.3;

  try {
    const isValid = await verifyRecaptcha(token, requestedAction, threshold);
    res.status(200).json({ success: isValid });
  } catch (error) {
    console.error("Error in recaptchaVerifier:", error);
    res.status(500).json({ success: false, error: "Verification failed" });
  }
};

/**
 * reCAPTCHA v3 トークンを検証するユーティリティ関数
 *
 * @param token 検証するトークン
 * @param action 期待されるアクション名
 * @param threshold 許容するスコアの閾値
 * @returns 検証結果（成功: true, 失敗: false）
 */
export async function verifyRecaptcha(
  token: string,
  action: string,
  threshold: number,
): Promise<boolean> {
  const secret = process.env.RECAPTCHA_V3_SECRET_KEY;
  if (!secret) {
    // 仕様変更: 設定漏れは致命的なのでErrorをスロー (Fail Closed)
    console.error("RECAPTCHA_V3_SECRET_KEY is not set.");
    throw new Error("RECAPTCHA_V3_SECRET_KEY is not set.");
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        body: params,
      },
    );

    const data = (await response.json()) as {
      success: boolean;
      score: number;
      action: string;
      hostname: string;
      "error-codes"?: string[];
    };

    // 構造化ログの出力
    console.log(
      JSON.stringify({
        severity: "INFO",
        component: "recaptcha",
        token_verification: {
          success: data.success,
          score: data.score,
          action: data.action,
          hostname: data.hostname,
          expected_action: action,
          threshold: threshold,
          error_codes: data["error-codes"],
        },
      }),
    );

    if (!data.success) {
      console.warn("reCAPTCHA verification failed:", data["error-codes"]);
      return false;
    }

    if (data.action !== action) {
      console.warn(
        `reCAPTCHA action mismatch: expected '${action}', got '${data.action}'`,
      );
      return false;
    }

    if (data.score < threshold) {
      console.warn(
        `reCAPTCHA score too low: ${data.score} < ${threshold} (action: ${action})`,
      );
      return false;
    }

    return true;
  } catch (error) {
    // 仕様変更: Google APIエラー時はログを出して通す (Fail Open)
    console.error(
      JSON.stringify({
        severity: "ERROR",
        component: "recaptcha",
        result: "error_skipped", // 指示通りの識別子
        message: "Error during reCAPTCHA verification, allowing request.",
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    return true;
  }
}
