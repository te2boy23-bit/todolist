"use server";

import { createClient } from "@/lib/supabase/server";
import { getProfile } from "./profile";
import { revalidatePath } from "next/cache";

// 通知を取得する
export async function getNotifications() {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return [];

  // 目標日が近づいているプロジェクトのチェックと自動通知生成
  await generateDateReminders(supabase, profile.id);

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  return data;
}

// 既読にする
export async function markAsRead(notificationId: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return { success: false };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", profile.id);

  if (error) {
    console.error("Error marking as read:", error);
    return { success: false };
  }

  revalidatePath("/");
  return { success: true };
}

// すべて既読にする
export async function markAllAsRead() {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return { success: false };

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", profile.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all as read:", error);
    return { success: false };
  }

  revalidatePath("/");
  return { success: true };
}

// カレンダーの日付（プロジェクトの目標日）が近づいた時の通知生成ロジック
async function generateDateReminders(supabase: any, userId: string) {
  try {
    // 自分が参加しているプロジェクトを取得
    const { data: projects } = await supabase
      .from("projects")
      .select("*")
      .or(`owner_id.eq.${userId},partner_id.eq.${userId}`);

    if (!projects) return;

    const today = new Date();
    
    for (const project of projects) {
      // マイ通帳は除外
      if (project.invite_code === "PRIVATE_PASSBOOK") continue;

      const endDate = new Date(project.end_date);
      // 日数差を計算
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 3日前、または当日の場合に通知
      if (diffDays === 3 || diffDays === 0) {
        const title = diffDays === 0 ? "🎉 本日が目標日です！" : `📅 目標日まであと${diffDays}日！`;
        const content = `プロジェクト「${project.name}」の目標日が${diffDays === 0 ? "本日" : `あと${diffDays}日`}に迫っています。`;

        // 既に同じ内容の通知があるかチェック（重複防止）
        const { data: existing } = await supabase
          .from("notifications")
          .select("id")
          .eq("user_id", userId)
          .eq("project_id", project.id)
          .eq("title", title)
          .single();

        if (!existing) {
          // 通知を作成
          await supabase.from("notifications").insert([{
            user_id: userId,
            project_id: project.id,
            title,
            content
          }]);
        }
      }
    }
  } catch (err) {
    console.error("Error generating reminders:", err);
  }
}
