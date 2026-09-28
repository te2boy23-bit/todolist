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

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8 bg-gray-50/50 text-left">
              {/* セクション1 */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">
                    1
                  </div>
                  プロジェクト（目的）を作ろう！
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  まずは、「同棲費用」「ハワイ旅行」「車を買う」などの目的ごとにプロジェクトを作成します。
                </p>
                <div className="bg-blue-50/50 p-4 rounded-xl">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5 font-bold">•</span>
                      <span>
                        画面右上の「プロジェクト切替」から新しいプロジェクトを作成できます。
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5 font-bold">•</span>
                      <span>
                        作った後に「共有」ボタンから招待リンクをパートナーに送れば、一緒に使えます！
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5 font-bold">•</span>
                      <span>自分専用の「マイ通帳」としても使えます。</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* セクション2 */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">
                    2
                  </div>
                  お金を記録しよう (ダッシュボード)
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  メイン画面で、日々の支出や貯金を記録します。
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100/50">
                    <div className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4" /> 貯金する
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      目標に向けてお金を貯めるときに使います。誰が出したかも選べます。
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100/50">
                    <div className="font-bold text-red-700 flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4" /> 出費を記録
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      目標のために使ったお金を記録します。
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100/50">
                    <div className="font-bold text-amber-700 flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" /> 後払い
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      クレジットカードなどで払って、後で口座から引き落とされるものに便利です。
                    </p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100/50">
                    <div className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4" /> 臨時収入
                    </div>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      予期せぬ収入や、特別なお金が入った時に使います。
                    </p>
                  </div>
                </div>
                <div className="mt-5 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl text-sm text-gray-700 flex items-start gap-3 border border-yellow-100">
                  <span className="text-xl animate-bounce mt-1">✨</span>
                  <div>
                    <strong className="block text-yellow-800 mb-1">
                      お楽しみ要素
                    </strong>
                    <p className="leading-relaxed">
                      貯金をすると画面に紙吹雪が舞います！また、目標金額に近づくにつれてダッシュボードの植物アイコンが成長（🌱
                      → 🌿 → 🪴 → 🌸）します！
                    </p>
                  </div>
                </div>
              </section>

              {/* セクション3 */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">
                    3
                  </div>
                  やるべきことを管理しよう (Todo)
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-purple-50 p-4 rounded-full shrink-0">
                    <CheckSquare className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1 sm:mt-0">
                    目標に向けたタスク（例：「不動産屋に行く」「チケットを取る」など）をリスト化します。期限も設定でき、終わってチェックを入れると達成感のあるアニメーションが流れます🎊
                  </p>
                </div>
              </section>

              {/* セクション4 */}
              <section className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-3 border-b border-gray-50 pb-3">
                  <div className="bg-pink-100 text-pink-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">
                    4
                  </div>
                  パートナーと会話しよう (チャット)
                </h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="bg-pink-50 p-4 rounded-full shrink-0">
                    <MessageCircle className="w-6 h-6 text-pink-500" />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mt-1 sm:mt-0">
                    画面上部の吹き出しアイコン💬を押すとチャット画面が開きます。
                    <br className="hidden sm:block" />
                    相手が打っている時の「入力中…」表示や既読機能、間違えた時の「送信取り消し（ゴミ箱）」も使えます。
                  </p>
                </div>
              </section>
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white flex justify-end shrink-0 rounded-b-2xl">
              <button
                onClick={() => setIsOpen(false)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
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
