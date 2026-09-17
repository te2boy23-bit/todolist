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

export function PushNotificationManager({ userId }: { userId: string }) {
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
    } catch (error) {
      console.error("Push subscription error:", error);
      setMessage("通知の許可が得られませんでした");
      setTimeout(() => setMessage(""), 3000);
    }
    setLoading(false);
  }

  async function unsubscribeFromPush() {
    setLoading(true);
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setMessage("プッシュ通知をオフにしました");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Push unsubscription error:", error);
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
    <div className="flex items-center gap-2">
      {subscription ? (
        <button
          onClick={unsubscribeFromPush}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full transition-colors whitespace-nowrap shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <BellOff className="w-3.5 h-3.5 shrink-0" />
          )}
          通知をオフにする
        </button>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full transition-colors whitespace-nowrap shrink-0"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          ) : (
            <Bell className="w-3.5 h-3.5 shrink-0" />
          )}
          通知をオンにする
        </button>
      )}
      {message && <span className="text-xs text-blue-600">{message}</span>}
    </div>
  );
}
