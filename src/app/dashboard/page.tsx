import { SavingsProgress } from "@/components/dashboard/SavingsProgress";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "@/app/actions/project";
import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
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

  let myContribution = 0;
  let partnerContribution = 0;
  let recentTransactions: any[] = [];

  try {
    const supabase = await createClient();

    // プロジェクトに紐づくトランザクションを取得（ダミーのプロフィールデータは除外）
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("project_id", project.id)
      .neq("transaction_date", "2099-12-31")
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (transactions) {
      // 自分がパートナー(オーナーではない)の場合、DBの "me"/"partner" を反転させる
      const mappedTransactions = transactions.map((t) => {
        if (!isOwner) {
          return { ...t, payer: t.payer === "me" ? "partner" : "me" };
        }
        return t;
      });

      // メッセージ用ダミーやメモなどを除外
      const validTransactions = mappedTransactions.filter(
        (t) =>
          !t.memo ||
          (!t.memo.includes('"isMessage":true') &&
            !t.memo.includes('"isNote":true') &&
            !t.memo.includes('"isProfile":true')),
      );

      recentTransactions = validTransactions.slice(0, 10);

      const todayDate = new Date();
      todayDate.setHours(todayDate.getHours() + 9);
      const todayStr = todayDate.toISOString().split("T")[0];

      // 確定済みの（今日以前の）トランザクションだけを集計する
      const currentTransactions = validTransactions.filter(
        (t) => t.transaction_date && t.transaction_date <= todayStr,
      );

      const scheduledTransactions = validTransactions.filter(
        (t) =>
          t.transaction_date &&
          t.transaction_date > todayStr &&
          t.transaction_date !== "2099-12-31",
      );

      myContribution = currentTransactions
        .filter((t) => t.type === "deposit" && t.payer === "me")
        .reduce((sum, t) => sum + t.amount, 0);

      partnerContribution = currentTransactions
        .filter((t) => t.type === "deposit" && t.payer === "partner")
        .reduce((sum, t) => sum + t.amount, 0);

      const myIncome = currentTransactions
        .filter((t) => t.type === "income" && t.payer === "me")
        .reduce((sum, t) => sum + t.amount, 0);

      const scheduledExpenseAmount = scheduledTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const scheduledDepositAmount = scheduledTransactions
        .filter((t) => t.type === "deposit")
        .reduce((sum, t) => sum + t.amount, 0);

      // 一時的にグローバルオブジェクトなどに渡すか、コンポーネントのPropsに渡す
      // ここでは変数として持っておく
      Object.assign(project, {
        scheduledExpense: scheduledExpenseAmount,
        scheduledDeposit: scheduledDepositAmount,
        myIncome: myIncome,
      });
    }
  } catch (error) {
    console.error("Supabase fetch error:", error);
  }

  const totalAmount = myContribution + partnerContribution;
  const isSingle = !project.partner_id;
  const isPassbook = project.invite_code?.startsWith("PRIVATE_");
  const displayIncome = project.myIncome || 0;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {!isPassbook && <DashboardHeader project={project} profile={profile} />}

        {isPassbook && (
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h1 className="text-2xl font-bold mb-2 relative z-10">収入管理</h1>
            <p className="text-slate-400 text-sm mb-6 relative z-10">
              給与などの収入を記録します。
            </p>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="text-4xl font-bold">
                {displayIncome.toLocaleString()}
              </span>
              <span className="text-slate-400">円</span>
            </div>
            {(project.scheduledExpense > 0 || project.scheduledDeposit > 0) && (
              <div className="mt-4 pt-4 border-t border-white/20 relative z-10 grid grid-cols-2 gap-4">
                {project.scheduledDeposit > 0 && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      今後の収入予定
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      +{project.scheduledDeposit.toLocaleString()}円
                    </div>
                  </div>
                )}
                {project.scheduledExpense > 0 && (
                  <div>
                    <div className="text-xs text-slate-400 mb-1">
                      今後の支出予定
                    </div>
                    <div className="text-amber-400 font-semibold">
                      -{project.scheduledExpense.toLocaleString()}円
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-8">
          {!isPassbook && (
            <SavingsProgress
              project={project}
              currentAmount={totalAmount}
              myContribution={myContribution}
              partnerContribution={partnerContribution}
              myName={myName}
              partnerName={partnerName}
              isSingle={isSingle}
            />
          )}
          <TransactionForm
            myName={myName}
            partnerName={partnerName}
            isSingle={isSingle || isPassbook}
            isPassbook={isPassbook}
          />
          <TransactionHistory
            transactions={recentTransactions}
            myName={myName}
            partnerName={partnerName}
            isSingle={isSingle || isPassbook}
          />
        </div>
      </div>
    </div>
  );
}
