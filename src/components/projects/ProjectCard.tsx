"use client";

import { Wallet, Calendar, Trash2, LogOut } from "lucide-react";
import { format } from "date-fns";
import { useTransition } from "react";
import {
  selectProject,
  deleteProject,
  leaveProject,
} from "@/app/actions/project";

export function ProjectCard({
  project,
  currentUserId,
}: {
  project: any;
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const isOwner = project.owner_id === currentUserId;

  const handleAction = async (
    e: React.MouseEvent,
    actionType: "delete" | "leave",
  ) => {
    e.preventDefault();
    e.stopPropagation();

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
    startTransition(() => {
      selectProject(project.id);
    });
  };

  return (
    <div className="relative group">
      <button
        onClick={handleSelect}
        disabled={isPending}
        className="w-full text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group disabled:opacity-50"
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors pr-8">
            {project.name}
          </h2>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>目標: {project.target_amount.toLocaleString()}円</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>
              期間: {format(new Date(project.start_date), "yyyy/MM/dd")} 〜{" "}
              {format(new Date(project.end_date), "yyyy/MM/dd")}
            </span>
          </div>
        </div>
      </button>

      {/* 削除/退出ボタン（常に表示） */}
      <div className="absolute top-4 right-4 z-10">
        {isOwner ? (
          <button
            onClick={(e) => handleAction(e, "delete")}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all disabled:opacity-50"
            title="プロジェクトを削除"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={(e) => handleAction(e, "leave")}
            disabled={isPending}
            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all disabled:opacity-50"
            title="プロジェクトから退出"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
