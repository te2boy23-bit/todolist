import { SavingsProgress } from "@/components/dashboard/SavingsProgress";
import { TransactionForm } from "@/components/dashboard/TransactionForm";
import { TransactionHistory } from "@/components/dashboard/TransactionHistory";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "@/app/actions/project";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const project = await getCurrentProject();

  if (!project) {
    redirect("/projects");
  }

  let myContribution = 0;
  let partnerContribution = 0;
  let recentTransactions: any[] = [];

  try {
    const supabase = await createClient();

    // プロジェクトに紐づくトランザクションを取得
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (transactions) {
      recentTransactions = transactions.slice(0, 10);

      myContribution = transactions
        .filter((t) => t.type === "deposit" && t.payer === "me")
        .reduce((sum, t) => sum + t.amount, 0);

      partnerContribution = transactions
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
        <DashboardHeader project={project} />

        <div className="space-y-8">
          <SavingsProgress
            project={project}
            currentAmount={totalAmount}
            myContribution={myContribution}
            partnerContribution={partnerContribution}
          />
          <TransactionForm />
          <TransactionHistory transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}
