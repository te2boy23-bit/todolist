"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentProjectId } from "@/app/actions/project";
import { getProfile } from "@/app/actions/profile";

export async function addTransaction(data: {
  type: "income" | "deposit" | "expense";
  payer: "me" | "partner";
  amount: number;
  memo: string;
  transaction_date?: string;
}) {
  const projectId = await getCurrentProjectId();
  if (!projectId) throw new Error("No project selected");

  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) throw new Error("Unauthorized");

  // プロジェクトの情報を取得
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id, partner_id, name")
    .eq("id", projectId)
    .single();

  // 自分がパートナー(オーナーではない)の場合、"me" と "partner" を反転してDBに保存する
  // これによりDB内では常に me=オーナー, partner=パートナー に統一される
  let dbPayer = data.payer;
  if (project && project.owner_id !== profile.id) {
    dbPayer = data.payer === "me" ? "partner" : "me";
  }

  const { error } = await supabase.from("transactions").insert([
    {
      type: data.type,
      payer: dbPayer,
      amount: data.amount,
      memo: data.memo,
      transaction_date:
        data.transaction_date || new Date().toISOString().split("T")[0],
      project_id: projectId,
    },
  ]);

  if (error) {
    console.error("Error inserting transaction:", error);
    throw new Error(
      `Failed to add transaction: ${error.message || JSON.stringify(error)}`,
    );
  }

  // 相手に通知を送る
  if (project) {
    const targetUserId =
      project.owner_id === profile.id ? project.partner_id : project.owner_id;

    if (targetUserId) {
      const senderName = profile.display_name || "パートナー";
      const typeLabel =
        data.type === "deposit"
          ? "貯金"
          : data.type === "expense"
            ? "出費"
            : "収入";
      const title = `新しい${typeLabel}の記録`;
      const content = `${senderName}さんが「${project.name}」に ${data.amount.toLocaleString()}円 の${typeLabel}を記録しました。`;

      await supabase.from("notifications").insert([
        {
          user_id: targetUserId,
          project_id: projectId,
          title,
          content,
        },
      ]);

      try {
        const { sendNotification } = await import("./actions/webpush");
        await sendNotification(targetUserId, title, content, "/");
      } catch (err) {
        console.error("Failed to send web push for transaction:", err);
      }
    }
  }

  // データ更新後に画面をリフレッシュ
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting transaction:", error);
    throw new Error("Failed to delete transaction");
  }

  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

export async function addTodo(data: {
  title: string;
  due_date?: string | null;
}) {
  const projectId = await getCurrentProjectId();
  if (!projectId) throw new Error("No project selected");

  const supabase = await createClient();

  const { error } = await supabase.from("todos").insert([
    {
      title: data.title,
      due_date: data.due_date || null,
      project_id: projectId,
    },
  ]);

  if (error) {
    console.error("Error adding todo:", error);
    throw new Error("Failed to add todo");
  }

  revalidatePath("/todos");
  revalidatePath("/calendar");
}

export async function toggleTodo(id: string, currentStatus: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("todos")
    .update({ is_completed: !currentStatus })
    .eq("id", id);

  if (error) {
    console.error("Error toggling todo:", error);
    throw new Error("Failed to toggle todo");
  }

  revalidatePath("/todos");
}

export async function deleteTodo(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) {
    console.error("Error deleting todo:", error);
    throw new Error("Failed to delete todo");
  }

  revalidatePath("/todos");
}

export async function updateTodo(
  id: string,
  data: { title: string; due_date?: string | null },
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("todos")
    .update({
      title: data.title,
      due_date: data.due_date || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating todo:", error);
    throw new Error("Failed to update todo");
  }

  revalidatePath("/todos");
  revalidatePath("/calendar");
}
