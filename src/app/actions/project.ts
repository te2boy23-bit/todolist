"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getProfile } from "./profile";

// ランダムな6桁の招待コードを生成する関数
function generateInviteCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// プロジェクト一覧の取得
export async function getProjects() {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return [];

  // 自分がオーナー、または自分がパートナー(参加者)として登録されているプロジェクトを取得
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .or(`owner_id.eq.${profile.id},partner_id.eq.${profile.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }

  return data;
}

// プロジェクトの作成
export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const targetAmount = parseInt(formData.get("target_amount") as string, 10);
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  if (!name || !targetAmount || !startDate || !endDate) {
    throw new Error("Missing fields");
  }

  // 重複しない招待コードを生成（簡易的に複数回試行）
  let inviteCode = generateInviteCode();
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase
      .from("projects")
      .select("id")
      .eq("invite_code", inviteCode)
      .single();
    if (!existing) break;
    inviteCode = generateInviteCode();
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        target_amount: targetAmount,
        start_date: startDate,
        end_date: endDate,
        owner_id: profile.id,
        invite_code: inviteCode,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }

  // 作成したプロジェクトを選択状態にする
  await selectProject(data.id);
}

// 招待コードでプロジェクトに参加する
export async function joinProject(inviteCode: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) throw new Error("Unauthorized");
  if (!inviteCode) throw new Error("Invite code is required");

  // 大文字に変換
  const code = inviteCode.toUpperCase().trim();

  // 招待コードからプロジェクトを検索
  const { data: project, error: searchError } = await supabase
    .from("projects")
    .select("*")
    .eq("invite_code", code)
    .single();

  if (searchError || !project) {
    return { success: false, error: "無効な招待コードです。" };
  }

  // 自分がオーナーの場合は参加不要
  if (project.owner_id === profile.id) {
    return { success: false, error: "あなたが作成したプロジェクトです。" };
  }

  // 既に参加済みの場合は不要
  if (project.partner_id === profile.id) {
    return { success: true };
  }

  // パートナーとして登録する（※既に誰かがいる場合は上書きするかエラーにするか。今回は上書きでOKとする）
  const { error: updateError } = await supabase
    .from("projects")
    .update({ partner_id: profile.id })
    .eq("id", project.id);

  if (updateError) {
    return { success: false, error: "プロジェクトの参加に失敗しました。" };
  }

  // 参加したプロジェクトを選択状態にする
  await selectProject(project.id);

  return { success: true };
}

// プロジェクトの選択（Cookieに保存）
export async function selectProject(projectId: string) {
  const cookieStore = await cookies();
  cookieStore.set("current_project_id", projectId, { path: "/" });
  redirect("/dashboard");
}

// 現在選択中のプロジェクトIDを取得
export async function getCurrentProjectId() {
  const cookieStore = await cookies();
  return cookieStore.get("current_project_id")?.value;
}

// 現在選択中のプロジェクトの詳細と、メンバーのプロフィール情報を取得
export async function getCurrentProject() {
  const projectId = await getCurrentProjectId();
  if (!projectId) return null;

  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !project) {
    return null;
  }

  // オーナーとパートナーの情報を取得
  const memberIds = [project.owner_id];
  if (project.partner_id) {
    memberIds.push(project.partner_id);
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .in("id", memberIds);

  const ownerProfile = profiles?.find((p) => p.id === project.owner_id);
  const partnerProfile = profiles?.find((p) => p.id === project.partner_id);

  return {
    ...project,
    ownerProfile,
    partnerProfile,
  };
}

// プロジェクトの削除
export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) throw new Error("Unauthorized");

  // オーナーであるか確認
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id")
    .eq("id", projectId)
    .single();

  if (!project || project.owner_id !== profile.id) {
    throw new Error("Only the owner can delete the project.");
  }

  // 削除実行 (ON DELETE CASCADE が設定されていれば関連データも消える)
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }

  // 現在選択中のプロジェクトだった場合はCookieをクリア
  const currentProjectId = await getCurrentProjectId();
  if (currentProjectId === projectId) {
    const cookieStore = await cookies();
    cookieStore.delete("current_project_id");
  }

  revalidatePath("/projects");
}

// プロジェクトから退出する (パートナーの場合)
export async function leaveProject(projectId: string) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) throw new Error("Unauthorized");

  // パートナーであることを確認し、partner_id を null にする
  const { error } = await supabase
    .from("projects")
    .update({ partner_id: null })
    .eq("id", projectId)
    .eq("partner_id", profile.id);

  if (error) {
    console.error("Error leaving project:", error);
    throw new Error("Failed to leave project");
  }

  // 現在選択中のプロジェクトだった場合はCookieをクリア
  const currentProjectId = await getCurrentProjectId();
  if (currentProjectId === projectId) {
    const cookieStore = await cookies();
    cookieStore.delete("current_project_id");
  }

  revalidatePath("/projects");
}
