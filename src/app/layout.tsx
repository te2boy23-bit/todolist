import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { Navbar } from "@/components/layout/Navbar";
import { getProfile } from "@/app/actions/profile";
import { getProjects, getCurrentProject } from "@/app/actions/project";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plan Wallet | 夢を叶える共有貯金＆Todoアプリ",
  description:
    "旅行や同棲、趣味の資金。恋人や友人と一緒にお金を貯めながら、目標までのTodoを楽しく管理できる共有アプリです。",
  openGraph: {
    title: "Plan Wallet | 夢を叶える共有貯金＆Todoアプリ",
    description:
      "旅行や同棲、趣味の資金。恋人や友人と一緒にお金を貯めながら、目標までのTodoを楽しく管理できる共有アプリです。",
    type: "website",
    locale: "ja_JP",
    url: "https://plan-wallet.com",
    siteName: "Plan Wallet",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plan Wallet | 夢を叶える共有貯金＆Todoアプリ",
    description:
      "旅行や同棲、趣味の資金。恋人や友人と一緒にお金を貯めながら、目標までのTodoを楽しく管理できる共有アプリです。",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  other: {
    "google-adsense-account": "ca-pub-6902143388253005",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ① 変数（変数名: profile）
  // ログインしているユーザーの情報をデータベースから取得して「profile」という箱（変数）に入れます
  const profile = await getProfile();

  // ② 配列（変数名: projects）
  // ユーザーが持っている複数のプロジェクトをリスト（配列）として取得します。ない場合は空の配列 `[]` を入れます。
  const projects = profile ? await getProjects() : [];

  // ③ 変数（変数名: currentProject）
  // 現在選択中の１つのプロジェクト情報を取得して箱（変数）に入れます
  const currentProject = profile ? await getCurrentProject() : null;

  return (
    <html lang="ja">
      <head>
        {/* Google Adsenseのスクリプト追加 */}
        {/* Next.jsのScriptコンポーネントだと審査ロボットが認識しないことがあるため、通常のscriptタグを使用します */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6902143388253005"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-14 pb-24 sm:pb-0 sm:pt-16 min-h-screen flex flex-col bg-slate-50`}
      >
        <LanguageProvider>
          {/* Navbarというコンポーネント（部品）に、さっき取得した変数や配列を「プロパティ(props)」として渡しています */}
          <Navbar
            profile={profile}
            projects={projects}
            currentProject={currentProject}
          />
          <main className="flex-1 w-full">{children}</main>

          {/* 全ページの下部に表示されるフッター */}
          <footer className="w-full py-8 pb-32 sm:pb-8 flex justify-center items-center">
            <a
              href="https://buymeacoffee.com/tepeee"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:scale-105 transition-transform bg-[#FFDD00] text-black px-4 py-2 rounded-full font-bold shadow-sm"
            >
              <span className="text-xl">☕</span>
              開発者を支援する (Buy Me a Coffee)
            </a>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
