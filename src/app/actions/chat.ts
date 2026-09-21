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
    isRead: false,
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
  const targetUserId =
    project.owner_id === profile.id ? project.partner_id : project.owner_id;

  if (targetUserId && targetUserId !== profile.id) {
    // 相手の名前を取得する
    const senderName = profile.display_name || "パートナー";
    const title = "新しいメッセージ";
    const content = `${senderName}さんから「${project.name}」に新しいメッセージが届きました。`;

    await supabase.from("notifications").insert([
      {
        user_id: targetUserId,
        project_id: project.id,
        title,
        content,
      },
    ]);

    // Web Push 送信
    const { sendNotification } = await import("./webpush");
    await sendNotification(targetUserId, title, content, "/");
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
            isRead: pd.isRead || false,
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

export async function markMessagesAsRead() {
  const supabase = await createClient();
  const profile = await getProfile();
  const project = await getCurrentProject();

  if (!profile || !project) return { success: false };

  // 相手からの未読メッセージを検索して更新する
  // 相手の payer は、自分が owner なら "partner"、自分が partner なら "me"
  const partnerPayer = project.owner_id === profile.id ? "partner" : "me";

  const { data: unreadTx } = await supabase
    .from("transactions")
    .select("*")
    .eq("project_id", project.id)
    .eq("payer", partnerPayer);

  if (unreadTx && unreadTx.length > 0) {
    const toUpdate = [];
    for (const tx of unreadTx) {
      try {
        if (
          tx.memo &&
          tx.memo.includes('"isMessage":true') &&
          !tx.memo.includes('"isRead":true')
        ) {
          const pd = JSON.parse(tx.memo);
          pd.isRead = true;
          toUpdate.push({
            id: tx.id,
            memo: JSON.stringify(pd),
          });
        }
      } catch (e) {}
    }

    if (toUpdate.length > 0) {
      // バルクアップデートはループか Promise.all で行う
      await Promise.all(
        toUpdate.map((tx) =>
          supabase
            .from("transactions")
            .update({ memo: tx.memo })
            .eq("id", tx.id),
        ),
      );
    }
  }
  return { success: true };
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  const project = await getCurrentProject();

  if (!profile || !project) {
    throw new Error("Unauthorized");
  }

  // Check if the message exists and belongs to the user
  const { data: tx, error: fetchError } = await supabase
    .from("transactions")
    .select("memo")
    .eq("id", messageId)
    .single();

  if (fetchError || !tx) {
    throw new Error("Message not found");
  }

  try {
    const pd = JSON.parse(tx.memo);
    if (pd.userId !== profile.id) {
      throw new Error("Cannot delete someone else's message");
    }
  } catch (e) {
    throw new Error("Invalid message format");
  }

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("id", messageId);

  if (deleteError) {
    throw new Error(`Failed to delete message: ${deleteError.message}`);
  }

  return { success: true };
}
