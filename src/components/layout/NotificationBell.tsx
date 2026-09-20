"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Check, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useRouter } from "next/navigation";
import { useNotifications } from "./NotificationProvider";

export function NotificationBell() {
  const { t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const router = useRouter();

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const uniqueProjects = Array.from(
    new Map(
      notifications
        .filter((n) => n.project)
        .map((n) => [n.project.id, n.project]),
    ).values(),
  );

  const filteredNotifications = notifications.filter((n) => {
    if (projectFilter !== "all" && n.project_id !== projectFilter) return false;
    if (typeFilter === "added" && n.title.includes("削除されました"))
      return false;
    if (typeFilter === "deleted" && !n.title.includes("削除されました"))
      return false;
    return true;
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            ></div>
            <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] max-w-sm sm:w-96 sm:top-16 sm:left-auto sm:right-4 sm:translate-x-0 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {t("notification.title")}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      {t("notification.markAllRead")}
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-50">
                <select
                  value={projectFilter}
                  onChange={(e) => setProjectFilter(e.target.value)}
                  className="text-xs border-gray-200 rounded-md bg-gray-50 text-gray-700 flex-1 py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">すべてのプロジェクト</option>
                  {uniqueProjects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-xs border-gray-200 rounded-md bg-gray-50 text-gray-700 flex-1 py-1 px-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">すべてのお知らせ</option>
                  <option value="added">追加・その他</option>
                  <option value="deleted">削除された記録</option>
                </select>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    {t("notification.noNotifications")}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filteredNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) {
                            handleMarkAsRead(n.id, {
                              stopPropagation: () => {},
                            } as any);
                          }

                          // 遷移処理を追加
                          const text = (
                            n.title +
                            " " +
                            n.content
                          ).toLowerCase();
                          if (text.includes("メッセージ")) {
                            router.push("/dashboard?chat=open");
                          } else if (
                            text.includes("メモ") ||
                            text.includes("note")
                          ) {
                            router.push("/notes");
                          } else if (
                            text.includes("todo") ||
                            text.includes("タスク") ||
                            text.includes("期日")
                          ) {
                            router.push("/todos");
                          } else if (text.includes("目標日")) {
                            router.push("/dashboard");
                          } else {
                            router.push("/assets/history");
                          }
                          setIsOpen(false);
                        }}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !n.is_read ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4
                              className={`text-sm font-semibold mb-1 ${!n.is_read ? "text-gray-900" : "text-gray-600"}`}
                            >
                              {n.title}
                            </h4>
                            <p
                              className={`text-xs ${!n.is_read ? "text-gray-700" : "text-gray-500"} mb-2`}
                            >
                              {n.content}
                            </p>
                            <span className="text-[10px] text-gray-400">
                              {formatDistanceToNow(new Date(n.created_at), {
                                addSuffix: true,
                                locale: ja,
                              })}
                            </span>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
