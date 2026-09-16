"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentProjectId } from "@/app/actions/project";

export async function addTransaction(data: {
  type: "income" | "deposit" | "expense";
  payer: "me" | "partner";
  amount: number;
  memo: string;
}) {
  const projectId = await getCurrentProjectId();
  if (!projectId) throw new Error("No project selected");

  const supabase = await createClient();

  const { error } = await supabase.from("transactions").insert([
    {
      type: data.type,
      payer: data.payer,
      amount: data.amount,
      memo: data.memo,
      transaction_date: new Date().toISOString().split("T")[0],
      project_id: projectId,
    },
  ]);

  if (error) {
    console.error("Error inserting transaction:", error);
    throw new Error(
      `Failed to add transaction: ${error.message || JSON.stringify(error)}`,
    );
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
