"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// プロフィール情報の取得
export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile:", error);
    return null;
  }

  // プロフィールがない場合（初回ログイン時など）は作成
  if (!data) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newProfile = {
      id: session.user.id,
      display_name: session.user.user_metadata?.full_name || "名無し",
      avatar_url: session.user.user_metadata?.avatar_url || "",
      invite_code: inviteCode,
    };

    const { data: inserted, error: insertError } = await supabase
      .from("profiles")
      .insert([newProfile])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating profile:", insertError);
      return null;
    }
    return inserted;
  }

  // 既存プロフィールに招待コードがなければ生成して更新
  if (!data.invite_code) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: updated } = await supabase
      .from("profiles")
      .update({ invite_code: inviteCode })
      .eq("id", session.user.id)
      .select()
      .single();
    return updated || data;
  }

  return data;
}

// プロフィールの更新（名前、アイコンなど）
export async function updateProfile(displayName: string, avatarUrl: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      avatar_url: avatarUrl,
    })
    .eq("id", session.user.id);

  if (error) {
    console.error("Error updating profile:", error);
    throw new Error("Failed to update profile");
  }

  revalidatePath("/");
}

// 招待コードを使ってパートナーと連携する
export async function pairWithPartner(inviteCode: string) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("Not authenticated");

  // 相手のプロフィールを探す
  const { data: partner, error: findError } = await supabase
    .from("profiles")
    .select("id")
    .eq("invite_code", inviteCode)
    .single();

  if (findError || !partner) {
    throw new Error("Invalid invite code");
  }

  if (partner.id === session.user.id) {
    throw new Error("Cannot pair with yourself");
  }

  // お互いの partner_id を更新する
  await supabase
    .from("profiles")
    .update({ partner_id: partner.id })
    .eq("id", session.user.id);

  await supabase
    .from("profiles")
    .update({ partner_id: session.user.id })
    .eq("id", partner.id);

  revalidatePath("/");
  return true;
}
