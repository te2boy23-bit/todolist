"use client";

import {
  Wallet,
  Calendar,
  Trash2,
  LogOut,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { format } from "date-fns";
import { useTransition, useState, useRef, useEffect } from "react";
import {
  selectProject,
  deleteProject,
  leaveProject,
} from "@/app/actions/project";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { EditProjectModal } from "./EditProjectModal";

export function ProjectCard({
  project,
  currentUserId,
}: {
  project: any;
  currentUserId: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = project.owner_id === currentUserId;
  const isPrivatePassbook = project.invite_code?.startsWith("PRIVATE_");

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = async (
    e: React.MouseEvent,
    actionType: "delete" | "leave",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);

    if (actionType === "delete" && isPrivatePassbook) {
      alert("マイ通帳は削除できません。");
      return;
    }

    const msg =
      actionType === "delete"
        ? "このプロジェクトを完全に削除します。記録されたデータもすべて消去されます。本当によろしいですか？"
        : "このプロジェクトから退出します。よろしいですか？";

    if (!confirm(msg)) return;

    startTransition(async () => {
      try {
        if (actionType === "delete") {
          await deleteProject(project.id);
        } else {
          await leaveProject(project.id);
        }
      } catch (error: any) {
        console.error(error);
        alert(`操作に失敗しました: ${error.message}`);
      }
    });
  };

  const handleSelect = () => {
    startTransition(async () => {
      await selectProject(project.id);
      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="relative group">
      <button
        onClick={handleSelect}
        disabled={isPending}
        className={`w-full text-left p-6 rounded-2xl shadow-sm border transition-all group disabled:opacity-50 ${
          isPrivatePassbook
            ? "bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 hover:border-indigo-400 hover:shadow-md"
            : "bg-white border-gray-100 hover:border-blue-300 hover:shadow-md"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <h2
            className={`text-xl font-bold transition-colors pr-8 ${isPrivatePassbook ? "text-indigo-800" : "text-gray-800 group-hover:text-blue-600"}`}
          >
            {project.name}
          </h2>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>
              {t("project.targetAmount")}:{" "}
              {project.target_amount.toLocaleString()}
              {t("dashboard.currency")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>
              {t("project.period")}:{" "}
              {format(new Date(project.start_date), "yyyy/MM/dd")} -{" "}
              {format(new Date(project.end_date), "yyyy/MM/dd")}
            </span>
          </div>

          {(project.scheduledExpense > 0 || project.scheduledDeposit > 0) && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-[13px]">
              {project.scheduledDeposit > 0 && (
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">今後の貯金予定</span>
                  <span className="text-emerald-600 font-medium">
                    +{project.scheduledDeposit.toLocaleString()}円
                  </span>
                </div>
              )}
              {project.scheduledExpense > 0 && (
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">今後の支出予定</span>
                  <span className="text-amber-600 font-medium">
                    -{project.scheduledExpense.toLocaleString()}円
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </button>

      {/* 3点リーダーメニュー（常に表示、マイ通帳以外） */}
      {!isPrivatePassbook && (
        <div className="absolute top-4 right-4 z-10" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="メニューを開く"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  編集する
                </button>
              )}
              {isOwner ? (
                <button
                  onClick={(e) => handleAction(e, "delete")}
                  disabled={isPending}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("project.delete")}
                </button>
              ) : (
                <button
                  onClick={(e) => handleAction(e, "leave")}
                  disabled={isPending}
                  className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {t("project.leave")}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <EditProjectModal
          project={project}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}
