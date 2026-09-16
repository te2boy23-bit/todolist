"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { format } from "date-fns";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { PairingModal } from "@/components/profile/PairingModal";

export function DashboardHeader({ project, profile }: { project?: any; profile?: any }) {
  const { t } = useLanguage();

  return (
    <header className="mb-10 text-center space-y-4">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
      >
        <FolderKanban className="w-3.5 h-3.5" />
        プロジェクト一覧に戻る
      </Link>

      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {project?.name || t("dashboard.title")}
        </h1>
        {profile && (
          <div className="mt-2 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
            <span className="text-sm font-medium text-gray-600">あなたのプロフィール:</span>
            <PairingModal profile={profile} />
          </div>
        )}
        {project && (
          <p className="mt-2 text-sm text-gray-500">
            {format(new Date(project.start_date), "yyyy/MM/dd")} 〜{" "}
            {format(new Date(project.end_date), "yyyy/MM/dd")}
          </p>
        )}
      </div>
    </header>
  );
}
