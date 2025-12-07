import React, { useEffect, useRef } from "react";

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  remember: boolean;
  setRemember: (value: boolean) => void;
  showSuccessMessage: boolean;
}

/**
 * ユーザー向けリダイレクト確認モーダル。
 *
 * 主に「食事データ登録」フローの開始前に表示され、ユーザーの意思確認と設定の保存を行う。
 * 成功メッセージの表示機能も兼ね備えている。
 *
 * Props:
 * @param isOpen - モーダルの表示状態。
 * @param onClose - モーダルを閉じる際（背景クリック、Escapeキー、閉じるボタン）のコールバック。
 * @param onConfirm - 「登録する」ボタン押下時のコールバック。
 * @param remember - 「次回以降も記憶する」チェックボックスの状態。
 * @param setRemember - チェックボックスの状態更新関数。
 * @param showSuccessMessage - 認証成功メッセージを表示するかどうか。
 */
export default function RedirectModal({
  isOpen,
  onClose,
  onConfirm,
  remember,
  setRemember,
  showSuccessMessage,
}: RedirectModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-6">
          {showSuccessMessage && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-2">
              <h2
                id="modal-title"
                className="text-xl font-bold text-white mb-2"
              >
                登録ありがとうございます
              </h2>
              <p className="text-green-400">
                ✅ Fitbitの認証が確認できました！
              </p>
            </div>
          )}

          {!showSuccessMessage && (
            <h2 id="modal-title" className="sr-only">
              食事の記録登録
            </h2>
          )}

          <button
            onClick={onConfirm}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full shadow-lg"
          >
            食事の記録を登録する
          </button>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-center gap-3 bg-gray-700/30 p-3 rounded-lg border border-gray-700">
              <input
                type="checkbox"
                id="remember-redirect"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-500 rounded focus:ring-blue-500 focus:ring-offset-gray-800 cursor-pointer"
              />
              <label
                htmlFor="remember-redirect"
                className="text-sm text-gray-300 cursor-pointer select-none"
              >
                次回以降もこの設定を記憶する
              </label>
            </div>
            <p className="text-xs text-gray-400 text-center px-1">
              チェックをつけることで、次回以降トップページから直接JSON登録ページに遷移します。
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm text-center transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
