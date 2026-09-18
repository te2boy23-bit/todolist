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

  const { error } = await supabase.from("notes").insert([
    {
      project_id: project.id,
      user_id: profile.id,
      title,
      text,
    },
  ]);

  if (error) {
    console.error("Supabase insert error:", error);
    throw new Error(`Failed to add note: ${error.message}`);
  }

  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNote(id: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return { success: false };

  const { error } = await supabase.from("notes").delete().eq("id", id);

  if (error) throw new Error("Failed to delete note");

  revalidatePath("/notes");
  return { success: true };
}

export async function updateNote(id: string, title: string, text: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("notes")
    .update({ title, text })
    .eq("id", id)
    .eq("user_id", profile.id); // セキュリティのため、自分のノートだけ更新可能にする

  if (error) {
    console.error("Supabase update error:", error);
    throw new Error(`Failed to update note: ${error.message}`);
  }

  revalidatePath("/notes");
  return { success: true };
}
