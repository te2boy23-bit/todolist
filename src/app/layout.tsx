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
  title: "ふたりの目標を形にする - 共有貯金＆Todoアプリ",
  description:
    "同棲、結婚、旅行。パートナーと一緒にお金を管理し、共通のTodoをこなして、ふたりの夢を叶えるための共有アプリです。",
  openGraph: {
    title: "ふたりの目標を形にする - 共有貯金＆Todoアプリ",
    description:
      "同棲や結婚、旅行の資金をふたりで楽しく管理！お金の記録とTodoリストを共有できる専用アプリです。",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "ふたりの目標を形にする - 共有貯金＆Todoアプリ",
    description:
      "同棲や結婚、旅行の資金をふたりで楽しく管理！お金の記録とTodoリストを共有できる専用アプリです。",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased pb-16 sm:pb-0 sm:pt-16 min-h-screen flex flex-col bg-slate-50`}
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
