"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  CheckSquare,
  Calendar,
  Globe,
  FolderKanban,
} from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { LoginButton } from "@/components/auth/LoginButton";
import { PairingModal } from "@/components/profile/PairingModal";
import { selectProject } from "@/app/actions/project";
import { useTransition } from "react";

import { ShareProjectModal } from "@/components/projects/ShareProjectModal";

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
  ];

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    if (projectId) {
      startTransition(() => {
        selectProject(projectId);
      });
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 pb-safe sm:top-0 sm:bottom-auto sm:border-b sm:border-t-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Navigation Links */}
        <div className="flex items-center space-x-1 flex-1 justify-around sm:justify-start sm:space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 rounded-lg transition-colors text-xs sm:text-sm font-medium",
                  isActive
                    ? "text-blue-600 sm:bg-blue-50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <Icon
                  className={cn(
                    "w-6 h-6 sm:w-5 sm:h-5",
                    isActive ? "text-blue-600" : "text-gray-400",
                  )}
                />
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Right side controls */}
        <div className="ml-2 sm:ml-4 flex items-center gap-1.5 sm:gap-3">
          {/* Project Selector */}
          {profile && projects.length > 0 && (
            <div className="hidden sm:flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-gray-400" />
              <select
                disabled={isPending}
                value={currentProject?.id || ""}
                onChange={handleProjectChange}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-md focus:ring-blue-500 focus:border-blue-500 block px-2 py-1.5 max-w-[120px] truncate"
              >
                <option value="" disabled>
                  プロジェクト選択
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Share Button (Current Project) */}
          {currentProject && <ShareProjectModal project={currentProject} />}

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "ja" ? "en" : "ja")}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-2 sm:px-3 py-2 rounded-md transition-colors text-xs font-medium"
            title="Toggle Language"
          >
            <Globe className="w-4 h-4" />
            <span className="uppercase hidden sm:inline">{language}</span>
          </button>

          <div className="border-l border-gray-200 h-6 mx-0.5 sm:mx-1 hidden sm:block"></div>

          {/* Login / Profile */}
          <div className="flex items-center ml-1 sm:ml-0">
            {profile ? (
              <div className="flex items-center gap-2">
                <PairingModal profile={profile} />
                <div className="hidden sm:block">
                  <LoginButton />
                </div>
              </div>
            ) : (
              <div className="hidden sm:block">
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
