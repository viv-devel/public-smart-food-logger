import React, { useState } from "react";

interface RedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remember: boolean) => void;
}

export default function RedirectModal({
  isOpen,
  onClose,
  onConfirm,
}: RedirectModalProps) {
  const [remember, setRemember] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-6">
          <button
            onClick={() => onConfirm(remember)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg transition-colors w-full shadow-lg"
          >
            食事の記録を登録する
          </button>

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
