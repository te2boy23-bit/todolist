import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "@/app/actions/project";
import { getProfile } from "@/app/actions/profile";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { redirect } from "next/navigation";
import { NotesList } from "@/components/notes/NotesList";

export default async function NotesPage() {
  const project = await getCurrentProject();

  if (!project) {
    redirect("/projects");
  }

  const profile = await getProfile();
  const isPassbook = project.invite_code?.startsWith("PRIVATE_");

  let notes: any[] = [];

  try {
    const supabase = await createClient();

    const { data: txData } = await supabase
      .from("transactions")
      .select("*")
      .eq("project_id", project.id)
      .eq("amount", 0)
      .order("created_at", { ascending: false });

    if (txData) {
      notes = txData
        .map((tx: any) => {
          try {
            const memo = JSON.parse(tx.memo);
            if (memo && memo.isNote) {
              return {
                id: tx.id,
                title: memo.title || "",
                text: memo.text || "",
                userId: memo.userId,
                timestamp: memo.timestamp,
                created_at: tx.created_at,
              };
            }
          } catch (e) {
            return null;
          }
          return null;
        })
        .filter(Boolean);
    }
  } catch (error) {
    console.error("Supabase fetch error:", error);
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {!isPassbook && <DashboardHeader project={project} profile={profile} />}
        {isPassbook && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex items-center justify-between">
            <h1 className="text-xl font-bold relative z-10">
              個人通帳 - メモ帳
            </h1>
            <div className="text-sm text-slate-400 relative z-10">
              自由に書き込めるメモ
            </div>
          </div>
        )}

        <NotesList initialNotes={notes} currentUserId={profile?.id} />
      </div>
    </div>
  );
}
