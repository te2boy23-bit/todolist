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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getProfile();
  const projects = profile ? await getProjects() : [];
  const currentProject = profile ? await getCurrentProject() : null;

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-14 pb-24 sm:pb-0 sm:pt-16 min-h-screen flex flex-col bg-slate-50`}
      >
        <LanguageProvider>
          <Navbar
            profile={profile}
            projects={projects}
            currentProject={currentProject}
          />
          <main className="flex-1 w-full">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
