import { createClient } from "@/lib/supabase/server";

export async function getMyTotalAssets(profileId: string, projects: any[]) {
  if (!projects || projects.length === 0)
    return { totalDeposit: 0, totalExpense: 0, totalIncome: 0, balance: 0 };

  const supabase = await createClient();
  const projectIds = projects.map((p) => p.id);

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("type, amount, payer, memo, project_id")
    .in("project_id", projectIds);

  if (error || !transactions) {
    return { totalDeposit: 0, totalExpense: 0, totalIncome: 0, balance: 0 };
  }

  let totalDeposit = 0;
  let totalExpense = 0;
  let totalIncome = 0;

  for (const trx of transactions) {
    // 隠しトランザクション（チャットやメモなど）は除外
    if (trx.memo && trx.memo.includes('"isMessage":true')) continue;
    if (trx.memo && trx.memo.includes('"isNote":true')) continue;
    if (trx.memo && trx.memo.includes('"isProfile":true')) continue;

    const project = projects.find((p) => p.id === trx.project_id);
    if (!project) continue;

    const amIOwner = project.owner_id === profileId;

    // この支払いが自分によるものか判定
    const isMyTransaction =
      (amIOwner && trx.payer === "me") ||
      (!amIOwner && trx.payer === "partner");

    if (isMyTransaction) {
      if (trx.type === "deposit") totalDeposit += trx.amount;
      if (trx.type === "expense") totalExpense += trx.amount;
      if (trx.type === "income") totalIncome += trx.amount;
    }
  }

  const balance = totalDeposit + totalIncome - totalExpense;

  return { totalDeposit, totalExpense, totalIncome, balance };
}
