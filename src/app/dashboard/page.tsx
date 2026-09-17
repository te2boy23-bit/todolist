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

      // メッセージ用ダミートランザクションを除外
      const validTransactions = mappedTransactions.filter(
        (t) => !t.memo || !t.memo.includes('"isMessage":true'),
      );

      recentTransactions = validTransactions.slice(0, 10);

      myContribution = validTransactions
        .filter((t) => t.type === "deposit" && t.payer === "me")
        .reduce((sum, t) => sum + t.amount, 0);

      partnerContribution = validTransactions
        .filter((t) => t.type === "deposit" && t.payer === "partner")
        .reduce((sum, t) => sum + t.amount, 0);
    }
  } catch (error) {
    console.error("Supabase fetch error:", error);
  }

  const totalAmount = myContribution + partnerContribution;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <DashboardHeader project={project} profile={profile} />

        <div className="space-y-8">
          <SavingsProgress
            project={project}
            currentAmount={totalAmount}
            myContribution={myContribution}
            partnerContribution={partnerContribution}
            myName={myName}
            partnerName={partnerName}
          />
          <TransactionForm myName={myName} partnerName={partnerName} />
          <TransactionHistory
            transactions={recentTransactions}
            myName={myName}
            partnerName={partnerName}
          />
        </div>
      </div>
    </div>
  );
}
