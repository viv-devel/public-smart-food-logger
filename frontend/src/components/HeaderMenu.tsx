"use client";

import { AnimatePresence, motion, Variants } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useFirebaseAuth } from "@/app/auth/FirebaseAuthProvider";

/**
 * ヘッダーメニューコンポーネント。
 *
 * 画面右上のハンバーガーメニューを提供し、ナビゲーション機能と認証状態に応じたアクション（ログアウトなど）を管理する。
 * Framer Motionを使用して、スムーズな開閉アニメーションを実現している。
 *
 * 主な機能:
 * - ナビゲーションリンクの表示（認証状態による切り替えあり）。
 * - ログアウト処理の実行（確認ダイアログ付き）。
 * - メニュー展開時の背景スクロールロック。
 */
export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useFirebaseAuth();
  const [isFitbitAuthCompleted, setIsFitbitAuthCompleted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsFitbitAuthCompleted(
        localStorage.getItem("fitbitAuthCompleted") === "true",
      );
    }
  }, [isOpen]); // メニューが開くときに再確認

  // Prevent scrolling when menu is open
  useEffect(() => {
    const bodyClassList = document.body.classList;
    if (isOpen) {
      bodyClassList.add("overflow-hidden");
    } else {
      bodyClassList.remove("overflow-hidden");
    }
    return () => {
      bodyClassList.remove("overflow-hidden");
    };
  }, [isOpen]);

  const handleLogout = async () => {
    if (confirm("Fitbit連携を解除してログアウトしますか？")) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("fitbitAuthCompleted");
        localStorage.removeItem("redirectRemembered");
      }
      try {
        const { getAuth, signOut } = await import("firebase/auth");
        const auth = getAuth();
        await signOut(auth);

        // Reload to force state cleanup
        window.location.href = "/";
      } catch (error) {
        console.error("ログアウトエラー:", error);
        alert("ログアウトに失敗しました");
      }
      setIsOpen(false);
    }
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  // Animation variants
  const sidebarVariants: Variants = {
    closed: {
      x: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  };

  const overlayVariants: Variants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  };

  return (
    <div className="relative z-50">
      <button
        onClick={toggleMenu}
        className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
        aria-label="メニュー"
        data-testid="header-menu-button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
              data-testid="header-menu-overlay"
            />

            {/* Sidebar (Drawer) */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed top-0 right-0 bottom-0 w-72 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 overflow-y-auto"
              data-testid="header-menu-drawer"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-lg font-bold text-gray-100">メニュー</h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors"
                    aria-label="閉じる"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <nav className="flex-1 space-y-2">
                  <Link
                    href="/?show_top=true"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    アプリトップ
                  </Link>

                  <div className="my-4 border-t border-gray-800" />

                  {user && isFitbitAuthCompleted && (
                    <Link
                      href="/register"
                      className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      JSON登録
                    </Link>
                  )}
                  <Link
                    href="/instructions"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    設定手順
                  </Link>
                  <Link
                    href="/tips"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    使い方のヒント
                  </Link>

                  <div className="my-4 border-t border-gray-800" />

                  <Link
                    href="/terms"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    利用規約
                  </Link>
                  <Link
                    href="/privacy"
                    className="block px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    プライバシーポリシー
                  </Link>

                  {user && isFitbitAuthCompleted && (
                    <>
                      <div className="my-4 border-t border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                      >
                        連携解除
                      </button>
                    </>
                  )}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
