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

export async function unsubscribeUser(userId: string, sub?: PushSubscription) {
  const supabase = await createClient();

  // サブスクリプションをDBから削除
  let query = supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", userId);

  // もし特定の端末のサブスクリプション情報があれば、それだけを削除
  if (sub) {
    query = query.eq("subscription->>endpoint", sub.endpoint);
  }

  const { error } = await query;

  if (error) {
    console.error("Error deleting subscription:", error);
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
  // RLSをバイパスして相手のサブスクリプションを取得するために、Service Role Keyを使用する
  const { createClient: createSupabaseClient } =
    await import("@supabase/supabase-js");
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // ユーザーのサブスクリプションを取得
  const { data: subs, error } = await supabaseAdmin
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
        await supabaseAdmin
          .from("push_subscriptions")
          .delete()
          .eq("subscription", sub.subscription);
      }
    }
  }

  return { success: true, sentCount: successCount };
}
