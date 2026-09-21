import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/i18n/LanguageProvider";
import { Navbar } from "@/components/layout/Navbar";
import { getProfile } from "@/app/actions/profile";
import { getProjects, getCurrentProject } from "@/app/actions/project";
import { Toaster } from "react-hot-toast";
import { RealtimeNotifications } from "@/components/notifications/RealtimeNotifications";
import { NotificationProvider } from "@/components/layout/NotificationProvider";
import { CelebrationProvider } from "@/components/layout/CelebrationProvider";

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

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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

  const currentProject = await getCurrentProject();

  return (
    <html lang="ja">
      <head>
        <meta name="google-adsense-account" content="ca-pub-6902143388253005" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6902143388253005"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 min-h-screen text-gray-900 pb-20 sm:pb-0 font-sans`}
      >
        <LanguageProvider>
          <NotificationProvider>
            <CelebrationProvider>
              {profile && <RealtimeNotifications userId={profile.id} />}
              <Navbar
                profile={profile}
                projects={projects}
                currentProject={currentProject}
              />
              <main className="max-w-6xl mx-auto pt-14 sm:pt-20">
                {children}
              </main>
              <Toaster position="bottom-center" />
            </CelebrationProvider>
          </NotificationProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
