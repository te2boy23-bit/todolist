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

  const privateInviteCode = `PRIVATE_${profile.id.substring(0, 8)}`;

  // 「マイ通帳」が存在するかチェック
  const hasPassbook = data.some(
    (p) => p.invite_code === privateInviteCode && p.owner_id === profile.id,
  );
  // 「マイ通帳 (個人用)」という名前のプロジェクトを全て抽出
  const allPassbooks = data.filter(
    (p) => p.name === "マイ通帳 (個人用)" && p.owner_id === profile.id,
  );

  // 作成日時が一番古いもの（ユーザーが最初から使っていたもの）を「本物のマイ通帳」とする
  let realPassbook = null;
  if (allPassbooks.length > 0) {
    // data は降順なので、一番最後が一番古い
    realPassbook = allPassbooks[allPassbooks.length - 1];
  }

  // 重複排除とリスト作成
  const uniqueProjects = [];

  for (const p of data) {
    if (p.name === "マイ通帳 (個人用)") {
      // 本物のマイ通帳だけをリストに加える
      if (realPassbook && p.id === realPassbook.id) {
        uniqueProjects.push(p);
      } else {
        // それ以外のダミーのマイ通帳は完全に無視する
        continue;
      }
    } else {
      uniqueProjects.push(p);
    }
  }

  // もし本物のマイ通帳の invite_code が privateInviteCode ではない場合、
  // 他の判定でエラーにならないように、バックグラウンドで invite_code を修正しておく
  if (realPassbook && realPassbook.invite_code !== privateInviteCode) {
    realPassbook.invite_code = privateInviteCode;
    supabase
      .from("projects")
      .update({ invite_code: privateInviteCode })
      .eq("id", realPassbook.id)
      .then(() => console.log("Fixed invite_code for passbook"));
  }

  let foundPassbook = !!realPassbook;

  if (!foundPassbook) {
    // なければ作成
    const { data: passbook, error: insertError } = await supabase
      .from("projects")
      .insert([
        {
          name: "マイ通帳 (個人用)",
          target_amount: 1000000,
          start_date: new Date().toISOString().split("T")[0],
          end_date: new Date(new Date().getFullYear() + 10, 11, 31)
            .toISOString()
            .split("T")[0],
          owner_id: profile.id,
          invite_code: privateInviteCode,
        },
      ])
      .select()
      .single();

    if (!insertError && passbook) {
      uniqueProjects.push(passbook);
    } else {
      console.error("Failed to create passbook", insertError);
    }
  }

  // ソート: マイ通帳を一番上に、残りは作成日時降順
  return uniqueProjects.sort((a, b) => {
    if (a.invite_code?.startsWith("PRIVATE_")) return -1;
    if (b.invite_code?.startsWith("PRIVATE_")) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// プロジェクトの作成
export async function createProject(formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const targetAmount = parseInt(formData.get("target_amount") as string, 10);
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  if (!name || !targetAmount || !startDate || !endDate) {
    return { error: "Missing fields" };
  }

  // まずプロフィールが存在するか確認
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profile.id)
    .single();

  if (!existingProfile) {
    // プロフィールが存在しない場合、作成を試みる
    const { error: insertProfileError } = await supabase
      .from("profiles")
      .insert([
        {
          id: profile.id,
          display_name: profile.name || "User",
          avatar_url: profile.avatar_url || null,
        },
      ]);

    if (insertProfileError) {
      console.error("Failed to create profile:", insertProfileError);
      return {
        error: `プロフィール作成エラー: ${insertProfileError.message}`,
      };
    }
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
    return {
      error: `Failed to create project: ${error.message || JSON.stringify(error)}`,
    };
  }

  // 作成したプロジェクトを選択状態にする
  await selectProject(data.id);
  return { success: true };
}

// プロジェクトの更新
export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const profile = await getProfile();

  if (!profile) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const targetAmount = parseInt(formData.get("target_amount") as string, 10);
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;

  if (!name || !targetAmount || !startDate || !endDate) {
    return { error: "Missing fields" };
  }

  // オーナーかパートナーか確認
  const { data: project } = await supabase
    .from("projects")
    .select("owner_id, partner_id")
    .eq("id", projectId)
    .single();

  if (
    !project ||
    (project.owner_id !== profile.id && project.partner_id !== profile.id)
  ) {
    return { error: "権限がありません" };
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      target_amount: targetAmount,
      start_date: startDate,
      end_date: endDate,
    })
    .eq("id", projectId);

  if (error) {
    console.error("Error updating project:", error);
    return {
      error: `Failed to update project: ${error.message}`,
    };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  return { success: true };
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
    console.error("Error joining project:", updateError);
    return {
      success: false,
      error: `プロジェクトの参加に失敗しました。詳細: ${updateError.message}`,
    };
  }

  // 参加したプロジェクトを選択状態にする
  await selectProject(project.id);

  return { success: true };
}

// プロジェクトの選択（Cookieに保存）
export async function selectProject(projectId: string) {
  const cookieStore = await cookies();
  cookieStore.set("current_project_id", projectId, { path: "/" });
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

  const ownerProfile = profiles?.find((p) => p.id === project.owner_id) || {
    id: project.owner_id,
    name: "自分",
  };
  const partnerProfile = project.partner_id
    ? profiles?.find((p) => p.id === project.partner_id) || {
        id: project.partner_id,
        name: "パートナー",
      }
    : undefined;

  // 【究極のハック】隠しトランザクションからプロフィール情報を復元する
  const { data: dummyTx } = await supabase
    .from("transactions")
    .select("memo")
    .eq("project_id", projectId)
    .eq("transaction_date", "2099-12-31");

  if (dummyTx && dummyTx.length > 0) {
    for (const tx of dummyTx) {
      try {
        const pd = JSON.parse(tx.memo);
        if (pd.isProfile && pd.userId) {
          if (pd.userId === ownerProfile.id) {
            ownerProfile.name = pd.name;
            if (pd.avatar_url) ownerProfile.avatar_url = pd.avatar_url;
          }
          if (partnerProfile && pd.userId === partnerProfile.id) {
            partnerProfile.name = pd.name;
            if (pd.avatar_url) partnerProfile.avatar_url = pd.avatar_url;
          }
        }
      } catch (e) {
        // パースエラーは無視
      }
    }
  }

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
    throw new Error(
      `Failed to delete project: ${error.message || JSON.stringify(error)}`,
    );
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
