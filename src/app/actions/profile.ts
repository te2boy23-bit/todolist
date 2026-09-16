"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // プロフィールを取得
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // プロフィールが存在しない場合は新規作成する
    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          id: user.id,
          name:
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          avatar_url: user.user_metadata?.avatar_url || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return null;
    }
    return inserted;
  }

  return profile;
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not logged in");

  const name = formData.get("name") as string;
  const avatarUrl = formData.get("avatar_url") as string;

  const updates: any = {};
  if (name) updates.name = name;
  if (avatarUrl !== null) updates.avatar_url = avatarUrl; // 削除(null)も許容するならundefinedではなくチェックが必要

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      throw new Error("Failed to update profile");
    }

    revalidatePath("/", "layout");
  }

  return { success: true };
}
