"use client";

import { Wallet, ChevronRight } from "lucide-react";
import { useTransition } from "react";
import { selectProject } from "@/app/actions/project";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export function PassbookCard({ project }: { project: any }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();

  if (!project) return null;

  const handleSelect = () => {
    startTransition(async () => {
      await selectProject(project.id);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold text-gray-500 mb-3 px-1">
        {t("passbook.income")}
      </h2>
      <button
        onClick={handleSelect}
        disabled={isPending}
        className="w-full text-left bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl shadow-lg border border-slate-700 hover:shadow-xl transition-all group disabled:opacity-50 relative overflow-hidden"
      >
        {/* 背景の装飾 */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute left-0 bottom-0 w-24 h-24 bg-blue-500/10 rounded-full -ml-12 -mb-12 blur-xl"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Wallet className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide mb-1">
                {t("passbook.title")}
              </h2>
              <p className="text-slate-400 text-xs">
                {t("passbook.description")}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </button>
    </div>
  );
}
