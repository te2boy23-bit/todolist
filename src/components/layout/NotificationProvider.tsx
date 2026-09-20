"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@/app/actions/notification";

interface NotificationContextType {
  notifications: any[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCountForProject: (projectId: string) => number;
  getUnreadCountForTab: (projectId: string, tabName: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1分ごとに更新
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllAsRead();
  };

  const getUnreadCountForProject = (projectId: string) => {
    return notifications.filter((n) => !n.is_read && n.project_id === projectId)
      .length;
  };

  const getUnreadCountForTab = (projectId: string, tabName: string) => {
    return notifications.filter((n) => {
      if (n.is_read || n.project_id !== projectId) return false;
      const text = (n.title + " " + n.content).toLowerCase();

      if (tabName === "chat" || tabName === "dashboard") {
        return text.includes("メッセージ");
      }
      if (tabName === "todos") {
        return text.includes("todo") || text.includes("タスク");
      }
      if (tabName === "notes") {
        return text.includes("メモ") || text.includes("note");
      }
      if (tabName === "assets") {
        return (
          text.includes("記録") ||
          text.includes("お金") ||
          text.includes("収入") ||
          text.includes("出費")
        );
      }
      return false;
    }).length;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        getUnreadCountForProject,
        getUnreadCountForTab,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
}
