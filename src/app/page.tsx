import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions/profile";
import { LandingHero } from "@/components/home/LandingHero";
import { Footer } from "@/components/layout/Footer";
import { Wallet, CheckSquare, MessageCircle, Target, Users, Heart } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const profile = await getProfile();

  if (profile) {
    redirect("/projects");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ヒーローセクション（ログインフォーム含む） */}
      <LandingHero />

      {/* アプリのコンセプト */}
      <section className="py-20 bg-blue-50/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            ふたりで叶える、新しい目標管理
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-12">
            「ハワイ旅行にいきたい」「同棲資金を貯めたい」「車を買いたい」<br className="hidden sm:block" />
            そんなふたりの夢や目標を、家計簿（お金）とTodoリスト（タスク）の両面からサポートするアプリです。<br />
            もちろん、自分一人用の「お財布アプリ」としてもお使いいただけます。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">目標が明確になる</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                プロジェクトごとに目標金額と期限を設定できるので、モチベーションを維持しながら貯金やタスクを進められます。
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-emerald-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">リアルタイム共有</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                パートナーと家計簿を共有。誰がいくら貯金したか、どちらが払ったかなど、面倒な割り勘や家計管理もスムーズに。
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">楽しく続けられる</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                貯金やTodoをこなすと紙吹雪が舞い、目標に近づくにつれて画面の植物が育つなど、楽しい仕掛けが満載です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介 */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">主な機能</h2>
            <p className="text-gray-600">Plan Walletでできること</p>
          </div>

          <div className="space-y-12">
            {/* Feature 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">共有ダッシュボード（家計簿）</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  貯金や日々の出費、後払いなどを簡単に記録。目標に対して今どれくらい達成しているかが、プログレスバーで一目でわかります。カップルの生活費管理にも便利です。
                </p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100 w-full min-h-[200px] flex items-center justify-center text-center">
                <p className="text-gray-400 text-sm">※ アプリスクショ</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div className="flex-1">
                <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                  <CheckSquare className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Todoリストの共有</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  お金だけでなく、「いつまでに何をやるか」のタスクも共有。引越しや旅行の準備など、ふたりで協力してタスク管理ができます。
                </p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100 w-full min-h-[200px] flex items-center justify-center text-center">
                <p className="text-gray-400 text-sm">※ アプリスクショ</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <div className="bg-pink-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">リアルタイムチャット</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  アプリ内で直接会話が可能。「これ買っておいたよ！」「ありがとう！」などのコミュニケーションが、お金の記録と一緒に残せます。
                </p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-6 border border-gray-100 w-full min-h-[200px] flex items-center justify-center text-center">
                <p className="text-gray-400 text-sm">※ アプリスクショ</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 使い方ガイドへの誘導 */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">より詳しい使い方はこちら</h2>
          <p className="text-gray-600 mb-8">
            プロジェクトの作り方や、パートナーの招待方法など、実際の画面を交えて解説しています。
          </p>
          <Link href="/guide" className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
            使い方ガイドを見る
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
