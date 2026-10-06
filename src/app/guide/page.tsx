import { Footer } from "@/components/layout/Footer";
import { HelpCircle, CheckSquare, Wallet, MessageCircle, Calendar } from "lucide-react";

export const metadata = {
  title: "使い方ガイド - Plan Wallet",
  description: "Plan Walletの使い方、プロジェクトの作成方法、お金の記録方法などを解説します。",
};

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <HelpCircle className="w-8 h-8" />
          使い方ガイド
        </h1>
        <p className="text-blue-100 max-w-2xl mx-auto">
          Plan Walletの基本的な使い方から、便利な機能までをご紹介します。
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
        {/* セクション1 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black">1</div>
            プロジェクトを作ろう
          </h2>
          <div className="prose prose-blue max-w-none text-gray-600">
            <p>
              まずは、「同棲費用」「ハワイ旅行」「車を買う」などの目的ごとにプロジェクトを作成します。
            </p>
            <ul>
              <li>画面右上の「プロジェクト切替」から新しいプロジェクトを作成できます。</li>
              <li>作った後に「共有」ボタンから招待リンクをパートナーに送れば、一緒に使えます！</li>
              <li>自分専用の「マイ通帳」としても使えます。</li>
            </ul>
          </div>
        </section>

        {/* セクション2 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="bg-emerald-100 text-emerald-600 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black">2</div>
            お金を記録しよう (ダッシュボード)
          </h2>
          <p className="text-gray-600 mb-6">メイン画面で、日々の支出や貯金を記録します。</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100/50">
              <div className="font-bold text-blue-700 flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5" /> 貯金する
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">目標に向けてお金を貯めるときに使います。誰が出したかも選べます。</p>
            </div>
            <div className="bg-red-50 p-5 rounded-2xl border border-red-100/50">
              <div className="font-bold text-red-700 flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5" /> 出費を記録
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">目標のために使ったお金を記録します。</p>
            </div>
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100/50">
              <div className="font-bold text-amber-700 flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5" /> 後払い
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">クレジットカードなどで払って、後で口座から引き落とされるものに便利です。</p>
            </div>
            <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100/50">
              <div className="font-bold text-orange-700 flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5" /> 臨時収入
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">予期せぬ収入や、特別なお金が入った時に使います。</p>
            </div>
          </div>
        </section>

        {/* セクション3 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="bg-purple-100 text-purple-600 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black">3</div>
            やるべきことを管理しよう (Todo)
          </h2>
          <div className="flex items-start gap-4">
            <div className="bg-purple-50 p-4 rounded-xl shrink-0">
              <CheckSquare className="w-8 h-8 text-purple-500" />
            </div>
            <p className="text-gray-600 leading-relaxed mt-1">
              目標に向けたタスク（例：「不動産屋に行く」「チケットを取る」など）をリスト化します。期限も設定でき、終わってチェックを入れると達成感のあるアニメーションが流れます🎊
            </p>
          </div>
        </section>

        {/* セクション4 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="bg-pink-100 text-pink-600 w-10 h-10 rounded-full flex items-center justify-center text-lg font-black">4</div>
            パートナーと会話しよう (チャット)
          </h2>
          <div className="flex items-start gap-4">
            <div className="bg-pink-50 p-4 rounded-xl shrink-0">
              <MessageCircle className="w-8 h-8 text-pink-500" />
            </div>
            <p className="text-gray-600 leading-relaxed mt-1">
              画面上部の吹き出しアイコン💬を押すとチャット画面が開きます。<br />
              相手が打っている時の「入力中…」表示や既読機能、間違えた時の「送信取り消し（ゴミ箱）」も使えます。
            </p>
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
