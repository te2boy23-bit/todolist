"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "./project";
import { getProfile } from "./profile";
import { revalidatePath } from "next/cache";

export async function addNote(title: string, text: string) {
  const supabase = await createClient();
  const profile = await getProfile();
  const project = await getCurrentProject();

  if (!profile || !project) {
    throw new Error("Unauthorized");
  }

  const memoObj = {
    isNote: true,
    title,
    text,
    userId: profile.id,
    timestamp: new Date().toISOString(),
  };

  const { error } = await supabase.from("transactions").insert([
    {
      project_id: project.id,
      type: "expense",
      amount: 0,
      payer: project.owner_id === profile.id ? "me" : "partner",
      memo: JSON.stringify(memoObj),
      transaction_date: new Date().toISOString().split("T")[0],
    },
  ]);

  if (error) {
    throw new Error(`Failed to add note: ${error.message}`);
  }

  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return { success: false };

  const { error } = await supabase.from("transactions").delete().eq("id", id);

  if (error) throw new Error("Failed to delete note");

  revalidatePath("/notes");
  return { success: true };
}
