"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  CheckSquare,
  Calendar,
  Globe,
  FolderKanban,
  FileText,
  Coffee,
  Menu,
  X,
} from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { LoginButton } from "@/components/auth/LoginButton";
import { PairingModal } from "@/components/profile/PairingModal";
import { selectProject } from "@/app/actions/project";
import { useTransition, useState } from "react";

import { ShareProjectModal } from "@/components/projects/ShareProjectModal";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { PushNotificationManager } from "@/components/notifications/PushNotificationManager";

import Image from "next/image";

export function Navbar({
  profile,
  projects = [],
  currentProject = null,
}: {
  profile: any;
  projects?: any[];
  currentProject?: any;
}) {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  const navItems = [
    { name: t("common.money"), path: "/dashboard", icon: Wallet },
    { name: t("common.todo"), path: "/todos", icon: CheckSquare },
    { name: t("common.calendar"), path: "/calendar", icon: Calendar },
    { name: "メモ", path: "/notes", icon: FileText },
  ];

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    if (projectId) {
      startTransition(() => {
        selectProject(projectId);
      });
    }
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* スマホ用 上部ヘッダー (sm以上では非表示) */}
      <div className="sm:hidden fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-40 px-4 py-2 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm relative border border-gray-100">
            <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
          </div>
          <span className="font-bold text-gray-800 text-sm tracking-tight hidden xs:inline">
            Todo & Money
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="scale-90 flex items-center gap-1">
            <NotificationBell />
            {profile && <PushNotificationManager userId={profile.id} />}
          </div>
          <div className="scale-90 flex items-center gap-2">
            {profile ? <PairingModal profile={profile} /> : <LoginButton />}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* スマホ用 ドロワーメニュー */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          {/* バックドロップ */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* メニュー本体 */}
          <div className="relative w-64 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 ml-auto">
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              <span className="font-bold text-gray-800">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* プロジェクト選択 */}
              {profile && projects.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 font-medium">
                    プロジェクト
                  </label>
                  <select
                    disabled={isPending}
                    value={currentProject?.id || ""}
                    onChange={handleProjectChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-3 py-2"
                  >
                    <option value="" disabled>
                      {t("project.select")}
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name === "マイ通帳 (個人用)"
                          ? t("project.passbookName")
                          : p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* メインナビゲーション */}
              {pathname !== "/projects" && (
                <div className="space-y-1">
                  <label className="text-xs text-gray-500 font-medium mb-2 block">
                    メニュー
                  </label>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-all font-medium",
                          isActive
                            ? "text-blue-600 bg-blue-50/80"
                            : "text-gray-600 hover:bg-gray-50",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-5 h-5",
                            isActive ? "text-blue-600" : "text-gray-400",
                          )}
                        />
                        <span className="text-sm">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              <hr className="border-gray-100" />

              {/* その他 */}
              <div className="space-y-2">
                <button
                  onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
                  className="w-full flex items-center justify-between p-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors font-medium"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">
                      言語切替 ({language.toUpperCase()})
                    </span>
                  </div>
                </button>
                <a
                  href="https://buymeacoffee.com/tepeee"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 p-3 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors font-medium"
                >
                  <Coffee className="w-5 h-5" />
                  <span className="text-sm">開発者を支援する</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインナビゲーション (PC専用: sm以上で表示) */}
      <nav
        className={cn(
          "hidden sm:flex fixed top-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 z-50 shadow-sm",
          pathname === "/projects" && "hidden",
        )}
      >
        <div className="max-w-6xl mx-auto px-4 min-h-[4rem] w-full flex items-center justify-between">
          {/* 左側: リンク群 */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
              <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm relative border border-gray-100">
                <Image
                  src="/logo.jpg"
                  alt="Logo"
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-bold text-gray-800 text-sm tracking-tight whitespace-nowrap">
                Todo & Money
              </span>
            </Link>

            {/* ナビゲーションタブ */}
            {pathname !== "/projects" &&
              navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.path);

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-medium shrink-0",
                      isActive
                        ? "text-blue-600 bg-blue-50/80"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 shrink-0",
                        isActive ? "text-blue-600" : "text-gray-400",
                      )}
                    />
                    <span className="text-sm whitespace-nowrap">
                      {item.name}
                    </span>
                  </Link>
                );
              })}
          </div>

          {/* 右側: コントロール群 */}
          <div className="flex items-center gap-3">
            {/* Project Selector */}
            {profile && projects.length > 0 && (
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-gray-400" />
                <select
                  disabled={isPending}
                  value={currentProject?.id || ""}
                  onChange={handleProjectChange}
                  className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-2 py-1.5 w-auto max-w-[150px] truncate"
                >
                  <option value="" disabled>
                    {t("project.select")}
                  </option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name === "マイ通帳 (個人用)"
                        ? t("project.passbookName")
                        : p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Share Button (Current Project) */}
            {currentProject &&
              !currentProject.invite_code?.startsWith("PRIVATE_") && (
                <ShareProjectModal project={currentProject} />
              )}

            {/* Buy Me a Coffee */}
            <a
              href="https://buymeacoffee.com/tepeee"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold shadow-sm border border-yellow-200"
              title="Buy Me a Coffee"
            >
              <Coffee className="w-4 h-4" />
              <span>支援</span>
            </a>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors text-xs font-medium"
              title="Toggle Language"
            >
              <Globe className="w-4 h-4" />
              <span className="uppercase">{language}</span>
            </button>

            <div className="border-l border-gray-200 h-6 mx-1"></div>

            {/* Notification Bell */}
            <div className="flex items-center gap-2">
              <NotificationBell />
              {profile && <PushNotificationManager userId={profile.id} />}
            </div>

            {/* Login / Profile */}
            <div className="flex items-center">
              {profile ? <PairingModal profile={profile} /> : <LoginButton />}
            </div>
          </div>
        </div>
      </nav>

      {/* チャットドロワー */}
      {currentProject &&
        !currentProject.invite_code?.startsWith("PRIVATE_") &&
        profile &&
        pathname !== "/projects" && (
          <ChatDrawer
            projectId={currentProject.id}
            currentUserId={profile.id}
            myProfile={
              currentProject.ownerProfile?.id === profile.id
                ? currentProject.ownerProfile
                : currentProject.partnerProfile
            }
            partnerProfile={
              currentProject.ownerProfile?.id === profile.id
                ? currentProject.partnerProfile
                : currentProject.ownerProfile
            }
          />
        )}
    </>
  );
}
