"use client";

import { useState, useEffect } from "react";
import { subscribeUser } from "@/app/actions/webpush";
import { Bell, BellOff, Loader2 } from "lucide-react";

// VAPIDキーをBase64からUint8Arrayに変換するユーティリティ
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager({
  userId,
  fullWidth = false,
}: {
  userId: string;
  fullWidth?: boolean;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
        ),
      });
      setSubscription(sub);

      // サーバーに保存
      await subscribeUser(sub as any, userId);
      setMessage("プッシュ通知をオンにしました！");
      setTimeout(() => setMessage(""), 3000);
    } catch (error: any) {
      console.error("Push subscription error:", error);
      alert(
        `通知設定エラー: ${error.message || "公開鍵の設定などに問題があります。"}`,
      );
      setMessage("通知の許可が得られませんでした");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  }

  async function unsubscribeFromPush() {
    setLoading(true);
    try {
      if (subscription) {
        // ブラウザ側での購読解除 (PWAでない場合などでエラーになっても無視する)
        try {
          await subscription.unsubscribe();
        } catch (e) {
          console.warn(
            "Browser unsubscription failed, but proceeding to remove from DB",
            e,
          );
        }
      }

      // サーバー側のサブスクリプションを削除 (この端末のみ)
      const { unsubscribeUser } = await import("@/app/actions/webpush");
      await unsubscribeUser(userId, subscription as PushSubscription);

      setSubscription(null);
      setMessage("プッシュ通知をオフにしました");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Push unsubscription error:", error);
      // エラーが起きてもUI上はオフ状態にする
      setSubscription(null);
    }
    setLoading(false);
  }

  if (!isSupported) {
    return (
      <div className="text-xs text-red-500">
        お使いのブラウザはプッシュ通知に対応していません
      </div>
    );
  }

  return (
    <div className={`flex items-center ${fullWidth ? "w-full" : ""}`}>
      {subscription ? (
        <button
          onClick={unsubscribeFromPush}
          disabled={loading}
          title="プッシュ通知をオフにする"
          className={
            fullWidth
              ? "flex items-center justify-between w-full p-3 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              : "flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors shrink-0"
          }
        >
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            {fullWidth && <span className="text-sm">通知をオフにする</span>}
          </div>
        </button>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          title="プッシュ通知をオンにする"
          className={
            fullWidth
              ? "flex items-center justify-between w-full p-3 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors font-medium"
              : "flex items-center justify-center w-8 h-8 text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors shrink-0"
          }
        >
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            {fullWidth && <span className="text-sm">通知をオンにする</span>}
          </div>
        </button>
      )}
    </div>
  );
}
