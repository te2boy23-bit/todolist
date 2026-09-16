"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { format } from "date-fns";
import { FolderKanban } from "lucide-react";
import Link from "next/link";
import { ProjectInviteCode } from "@/components/projects/ProjectInviteCode";

export function DashboardHeader({ project }: { project?: any }) {
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

      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {project?.name || t("dashboard.title")}
        </h1>
        {project && (
          <p className="mt-2 text-sm text-gray-500 mb-4">
            {format(new Date(project.start_date), "yyyy/MM/dd")} 〜{" "}
            {format(new Date(project.end_date), "yyyy/MM/dd")}
          </p>
        )}
        {project && (
          <div className="mt-4">
            <ProjectInviteCode project={project} />
          </div>
        )}
      </div>
    </header>
  );
}
