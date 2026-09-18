import { createClient } from "@/lib/supabase/server";

export async function getMyTotalAssets(profileId: string, projects: any[]) {
  if (!projects || projects.length === 0)
    return {
      totalDeposit: 0,
      totalExpense: 0,
      totalIncome: 0,
      balance: 0,
      scheduledDeposit: 0,
      scheduledExpense: 0,
      scheduledIncome: 0,
    };

  const supabase = await createClient();
  const projectIds = projects.map((p) => p.id);

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("type, amount, payer, memo, project_id, transaction_date")
    .in("project_id", projectIds);

  if (error || !transactions) {
    return {
      totalDeposit: 0,
      totalExpense: 0,
      totalIncome: 0,
      balance: 0,
      scheduledDeposit: 0,
      scheduledExpense: 0,
      scheduledIncome: 0,
    };
  }

  let totalDeposit = 0;
  let totalExpense = 0;
  let totalIncome = 0;

  let scheduledDeposit = 0;
  let scheduledExpense = 0;
  let scheduledIncome = 0;

  // JSTでの今日の日付を取得 (日本時間のUTC+9を簡易的に計算)
  const todayDate = new Date();
  todayDate.setHours(todayDate.getHours() + 9);
  const todayStr = todayDate.toISOString().split("T")[0];

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
      // 未来の日付かどうか (2099-12-31 はシステムの特殊な日付なので除外)
      const isScheduled =
        trx.transaction_date &&
        trx.transaction_date > todayStr &&
        trx.transaction_date !== "2099-12-31";

      if (isScheduled) {
        if (trx.type === "deposit") scheduledDeposit += trx.amount;
        if (trx.type === "expense") scheduledExpense += trx.amount;
        if (trx.type === "income") scheduledIncome += trx.amount;
      } else {
        if (trx.type === "deposit") totalDeposit += trx.amount;
        if (trx.type === "expense") totalExpense += trx.amount;
        if (trx.type === "income") totalIncome += trx.amount;
      }
    }
  }

  // 手持ち残高 = 確定済みの総収入 - 確定済みの総貯金 - 確定済みの総支出
  const balance = totalIncome - totalDeposit - totalExpense;

  return {
    totalDeposit,
    totalExpense,
    totalIncome,
    balance,
    scheduledDeposit,
    scheduledExpense,
    scheduledIncome,
  };
}

export async function getAllTransactions(profileId: string, projects: any[]) {
  if (!projects || projects.length === 0) return [];

  const supabase = await createClient();
  const projectIds = projects.map((p) => p.id);

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*, projects(name)")
    .in("project_id", projectIds)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !transactions) {
    return [];
  }

  const validTransactions = transactions.filter((trx) => {
    if (trx.memo && trx.memo.includes('"isMessage":true')) return false;
    if (trx.memo && trx.memo.includes('"isNote":true')) return false;
    if (trx.memo && trx.memo.includes('"isProfile":true')) return false;
    if (trx.transaction_date === "2099-12-31") return false;

    const project = projects.find((p) => p.id === trx.project_id);
    if (!project) return false;

    const amIOwner = project.owner_id === profileId;
    return (
      (amIOwner && trx.payer === "me") || (!amIOwner && trx.payer === "partner")
    );
  });

  return validTransactions;
}
