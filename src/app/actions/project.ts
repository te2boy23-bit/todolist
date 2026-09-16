"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getProfile } from "./profile";

// プロジェクト一覧の取得
export async function getProjects() {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return [];

  // 自分がオーナー、またはパートナーがオーナーのプロジェクトを取得
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .or(
      `owner_id.eq.${profile.id}${profile.partner_id ? `,owner_id.eq.${profile.partner_id}` : ""}`,
    )
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

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        name,
        target_amount: targetAmount,
        start_date: startDate,
        end_date: endDate,
        owner_id: profile.id,
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

// 現在選択中のプロジェクトの詳細を取得
export async function getCurrentProject() {
  const projectId = await getCurrentProjectId();
  if (!projectId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}
