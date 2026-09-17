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
      // 自分がパートナー(オーナーではない)の場合、DBの "me"/"partner" を反転させる
      const mappedTxData = txData.map((t) => {
        if (!isOwner) {
          return { ...t, payer: t.payer === "me" ? "partner" : "me" };
        }
        return t;
      });

      const validTxData = mappedTxData.filter(
        (t) => !t.memo || !t.memo.includes('"isMessage":true'),
      );
      transactions = validTxData;
      const totalDeposit = validTxData
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = validTxData
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

  const isSingle = !project.partner_id;
  const isPassbook = project.invite_code?.startsWith("PRIVATE_");

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {!isPassbook && <DashboardHeader project={project} profile={profile} />}

        {isPassbook && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex items-center justify-between">
            <h1 className="text-xl font-bold relative z-10">
              個人通帳 - カレンダー
            </h1>
            <div className="text-sm text-slate-400 relative z-10">
              月別の記録
            </div>
          </div>
        )}

        <CalendarView
          transactions={transactions}
          currentBalance={currentBalance}
          todos={todos}
          myName={myName}
          partnerName={partnerName}
          isSingle={isSingle || isPassbook}
          isPassbook={isPassbook}
        />
      </div>
    </div>
  );
}
