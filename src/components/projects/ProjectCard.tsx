"use client";

import { Wallet, Calendar, Trash2, LogOut, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useTransition, useState, useRef, useEffect } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = project.owner_id === currentUserId;

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

      {/* 3点リーダーメニュー（常に表示） */}
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
            {isOwner ? (
              <button
                onClick={(e) => handleAction(e, "delete")}
                disabled={isPending}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                削除する
              </button>
            ) : (
              <button
                onClick={(e) => handleAction(e, "leave")}
                disabled={isPending}
                className="w-full text-left px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                退出する
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
