"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "./project";
import { getProfile } from "./profile";
import { unstable_noStore as noStore } from "next/cache";

export async function addMessage(text: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  const project = await getCurrentProject();

  if (!profile || !project) {
    throw new Error("Unauthorized");
  }

  const memoObj = {
    isMessage: true,
    text,
    userId: profile.id,
    timestamp: new Date().toISOString(),
  };

  const { error } = await supabase.from("transactions").insert([
    {
      project_id: project.id,
      type: "expense",
      amount: 1,
      payer: project.owner_id === profile.id ? "me" : "partner",
      memo: JSON.stringify(memoObj),
      transaction_date: new Date().toISOString().split("T")[0],
    },
  ]);

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  // 相手に通知を送る
  const targetUserId = project.owner_id === profile.id ? project.partner_id : project.owner_id;
  
  if (targetUserId) {
    // 相手の名前を取得する（簡易的に "パートナー" として送るか、現在の名前を使う）
    const senderName = profile.display_name || "パートナー";
    await supabase.from("notifications").insert([
      {
        user_id: targetUserId,
        project_id: project.id,
        title: "新しいメッセージ",
        content: `${senderName}さんから「${project.name}」に新しいメッセージが届きました。`,
      }
    ]);
  }

  return { success: true };
}

export async function getMessages() {
  noStore();
  const supabase = await createClient();
  const project = await getCurrentProject();

  if (!project) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  // memo に JSON が入っており isMessage: true のものだけ抽出
  const messages = data
    .map((tx: any) => {
      try {
        const pd = JSON.parse(tx.memo);
        if (pd && pd.isMessage) {
          return {
            id: tx.id,
            text: pd.text,
            userId: pd.userId,
            timestamp: pd.timestamp,
            created_at: tx.created_at,
          };
        }
      } catch (e) {
        return null;
      }
      return null;
    })
    .filter(Boolean);

  return messages;
}
