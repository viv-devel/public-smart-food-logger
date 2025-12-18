"use client";

import { useCallback } from "react";

/**
 * reCAPTCHA v3 のトークン取得およびバックエンド検証を行うためのフック。
 *
 * @returns {Object} reCAPTCHA操作用関数を含むオブジェクト
 * - `executeRecaptcha(action)`: Googleサーバーからトークンを取得します。
 * - `verifyWithBackend(token, action)`: バックエンドAPIを呼び出してトークンを検証します。
 */
export function useRecaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

  /**
   * reCAPTCHA v3 トークンを取得します。
   *
   * @param {string} action - 検証のアクション名 (例: 'login', 'submit_form')
   * @returns {Promise<string>} 取得したトークン
   * @throws {Error} reCAPTCHAがロードされていない、またはキーが設定されていない場合
   */
  const executeRecaptcha = useCallback(
    async (action: string): Promise<string> => {
      if (!siteKey) {
        throw new Error("reCAPTCHA site key is not configured");
      }

      if (!window.grecaptcha) {
        throw new Error("reCAPTCHA script not loaded");
      }

      return new Promise((resolve, reject) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(siteKey, { action });
            resolve(token);
          } catch (error) {
            reject(error);
          }
        });
      });
    },
    [siteKey],
  );

  /**
   * 取得したトークンをバックエンドで検証します。
   *
   * @param {string} token - executeRecaptchaで取得したトークン
   * @param {string} action - アクション名
   * @returns {Promise<boolean>} 検証結果 (true: 成功, false: 失敗)
   * @throws {Error} バックエンドURLが未設定、またはAPI呼び出しエラーの場合
   */
  const verifyWithBackend = useCallback(
    async (token: string, action: string): Promise<boolean> => {
      if (!backendUrl) {
        console.error("Backend URL is not configured");
        return false;
      }

      try {
        const response = await fetch(`${backendUrl}/recaptchaVerifier`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, action }),
        });

        if (!response.ok) {
          console.error("Failed to verify recaptcha", response.statusText);
          return false;
        }

        const data = await response.json();
        return data.success === true;
      } catch (error) {
        console.error("Error verifying recaptcha:", error);
        return false;
      }
    },
    [backendUrl],
  );

  return { executeRecaptcha, verifyWithBackend };
}
