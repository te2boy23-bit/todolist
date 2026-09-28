"use client";

import { useState } from "react";
import {
  HelpCircle,
  X,
  CheckSquare,
  Wallet,
  MessageCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function HelpModal({
  variant = "icon",
}: {
  variant?: "icon" | "menuItem";
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          title="使い方ガイド"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium text-left"
        >
          <HelpCircle className="w-5 h-5 text-gray-400" />
          <span className="text-sm">使い方ガイド</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                Plan Wallet 使い方ガイド
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-6 sm:space-y-8 bg-gray-50/50 text-left">
              {/* セクション1 */}
              <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    1
                  </span>
                  プロジェクト（目的）を作ろう！
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  まずは、「同棲費用」「ハワイ旅行」「車を買う」などの目的ごとにプロジェクトを作成します。
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 list-disc list-inside ml-2">
                  <li>
                    画面右上の「プロジェクト切替」から新しいプロジェクトを作成できます。
                  </li>
                  <li>
                    作った後に「共有」ボタンから招待リンクをパートナーに送れば、一緒に使えます！
                  </li>
                  <li>自分専用の「マイ通帳」としても使えます。</li>
                </ul>
              </section>

              {/* セクション2 */}
              <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    2
                  </span>
                  お金を記録しよう (ダッシュボード)
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-2">
                  メイン画面で、日々の支出や貯金を記録します。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="font-semibold text-blue-700 block mb-1">
                      💰 貯金する
                    </span>
                    目標に向けてお金を貯めるときに使います。誰が出したかも選べます。
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <span className="font-semibold text-red-700 block mb-1">
                      💸 出費を記録
                    </span>
                    目標のために使ったお金を記録します。
                  </div>
                  <div className="bg-amber-50 p-3 rounded-lg">
                    <span className="font-semibold text-amber-700 block mb-1">
                      ⏳ 後払い
                    </span>
                    クレジットカードなどで払って、後で口座から引き落とされるものに便利です。
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <span className="font-semibold text-orange-700 block mb-1">
                      🎁 臨時収入
                    </span>
                    予期せぬ収入や、特別なお金が入った時に使います。
                  </div>
                </div>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700 flex items-start gap-2 border border-gray-100">
                  <span className="text-lg">✨</span>
                  <p>
                    <strong>お楽しみ要素:</strong>{" "}
                    貯金をすると画面に紙吹雪が舞います！
                    また、目標金額に近づくにつれてダッシュボードの植物アイコンが成長（🌱
                    → 🌿 → 🪴 → 🌸）します！
                  </p>
                </div>
              </section>

              {/* セクション3 */}
              <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    3
                  </span>
                  やるべきことを管理しよう (Todo)
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  目標に向けたタスク（例：「不動産屋に行く」「チケットを取る」など）をリスト化します。期限も設定でき、終わってチェックを入れると達成感のあるアニメーションが流れます🎊
                </p>
              </section>

              {/* セクション4 */}
              <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="bg-pink-100 text-pink-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                    4
                  </span>
                  パートナーと会話しよう (チャット)
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  画面上部の吹き出しアイコン💬を押すとチャット画面が開きます。
                  相手が打っている時の「入力中…」表示や既読機能、間違えた時の「送信取り消し（ゴミ箱）」も使えます。
                </p>
              </section>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                はじめる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
