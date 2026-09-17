"use server";

import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";

function initWebPush() {
  if (
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY
  ) {
    webpush.setVapidDetails(
      "mailto:example@yourdomain.org",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
      process.env.VAPID_PRIVATE_KEY as string,
    );
  }
}

export async function subscribeUser(sub: PushSubscription, userId: string) {
  initWebPush();
  const supabase = await createClient();

  // サブスクリプションをDBに保存
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_id: userId,
    subscription: sub,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Error saving subscription:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function sendNotification(
  userId: string,
  title: string,
  body: string,
  url: string = "/",
) {
  initWebPush();
  const supabase = await createClient();

  // ユーザーのサブスクリプションを取得
  const { data: subs, error } = await supabase
    .from("push_subscriptions")
    .select("subscription")
    .eq("user_id", userId);

  if (error || !subs || subs.length === 0) {
    console.error("No subscriptions found for user:", userId);
    return { success: false };
  }

  const payload = JSON.stringify({
    title,
    body,
    url,
    icon: "/logo.jpg",
  });

  let successCount = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub.subscription, payload);
      successCount++;
    } catch (error: any) {
      console.error("Error sending push notification:", error);
      // GONE (410) の場合はサブスクリプションが無効なので削除するなどの処理が可能
      if (error.statusCode === 410) {
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("subscription", sub.subscription);
      }
    }
  }

  return { success: true, sentCount: successCount };
}
