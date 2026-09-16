import { CalendarView } from "@/components/calendar/CalendarView";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"; // 共通のヘッダーを使うか、直書きするか
import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "@/app/actions/project";
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

    // トランザクション取得
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("project_id", project.id)
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

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <DashboardHeader project={project} />

        <CalendarView
          transactions={transactions}
          currentBalance={currentBalance}
          todos={todos}
        />
      </div>
    </div>
  );
}
