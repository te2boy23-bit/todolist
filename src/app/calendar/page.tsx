import { CalendarView } from "@/components/calendar/CalendarView";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "@/app/actions/project";
import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export default async function CalendarPage() {
  const project = await getCurrentProject();

  if (!project) {
    redirect("/projects");
  }

  let transactions: any[] = [];
  let todos: any[] = [];
  let currentBalance = 0;

  try {
    const supabase = await createClient();

    // トランザクション取得（ダミーのプロフィールデータは除外）
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("project_id", project.id)
      .neq("transaction_date", "2099-12-31")
      .order("transaction_date", { ascending: false });

    if (!txError && txData) {
      transactions = txData;
      const totalDeposit = txData
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = txData
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      currentBalance = totalDeposit - totalExpense;
    }

    // Todos取得 (期限日が設定されているもののみを取得するなど)
    const { data: todoData, error: todoError } = await supabase
      .from("todos")
      .select("*")
      .eq("project_id", project.id)
      .not("due_date", "is", null);

    if (!todoError && todoData) {
      todos = todoData;
    }
  } catch (error) {
    console.error("Supabase fetch error, using empty data", error);
  }

  // 自分のプロフィール
  const profile = await getProfile();
  // オーナーかどうかの判定
  const isOwner = project.owner_id === profile?.id;

  // 表示名（自分）
  const myName = profile?.name || "自分";

  // 表示名（相手）
  const partnerProfile = isOwner
    ? project.partnerProfile
    : project.ownerProfile;
  const partnerName = partnerProfile ? partnerProfile.name : "パートナー";

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <DashboardHeader project={project} profile={profile} />

        <CalendarView
          transactions={transactions}
          currentBalance={currentBalance}
          todos={todos}
          myName={myName}
          partnerName={partnerName}
        />
      </div>
    </div>
  );
}
