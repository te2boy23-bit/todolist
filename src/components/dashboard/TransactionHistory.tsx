"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { User, Trash2 } from "lucide-react";
import { useTransition, useState } from "react";
import { deleteTransaction } from "@/app/actions";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Transaction = {
  id: string;
  type: "income" | "deposit" | "expense";
  payer: "me" | "partner";
  amount: number;
  memo: string;
  transaction_date: string;
};

type FilterType = "all" | "me" | "partner";

interface TransactionHistoryProps {
  transactions: Transaction[];
  myName: string;
  partnerName: string;
  isSingle?: boolean;
}

export function TransactionHistory({
  transactions,
  myName,
  partnerName,
  isSingle,
}: TransactionHistoryProps) {
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<FilterType>("all");

  const handleDelete = (id: string) => {
    if (confirm("この記録を削除してもよろしいですか？")) {
      startTransition(async () => {
        try {
          await deleteTransaction(id);
        } catch (error) {
          console.error("Failed to delete", error);
        }
      });
    }
  };

  const filteredTransactions = transactions.filter((trx) => {
    if (filter === "all") return true;
    return trx.payer === filter;
  });

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-2xl mx-auto mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-500 px-1">最近の履歴</h3>

        {/* Filter Toggle */}
        {!isSingle && (
          <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-1.5 rounded-md font-medium transition-colors",
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              全体
            </button>
            <button
              onClick={() => setFilter("me")}
              className={cn(
                "px-4 py-1.5 rounded-md font-medium transition-colors",
                filter === "me"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {myName}
            </button>
            <button
              onClick={() => setFilter("partner")}
              className={cn(
                "px-4 py-1.5 rounded-md font-medium transition-colors",
                filter === "partner"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {partnerName}
            </button>
          </div>
        )}
      </div>

      <ul className="space-y-3">
        {filteredTransactions.map((trx) => (
          <li
            key={trx.id}
            className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${
                    trx.type === "deposit"
                      ? "bg-blue-100 text-blue-700"
                      : trx.type === "expense"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {trx.type === "deposit"
                    ? t("calendar.depositLabel")
                    : trx.type === "expense"
                      ? t("calendar.expenseLabel")
                      : t("calendar.incomeLabel")}
                </span>
                <span className="text-gray-700 text-sm sm:text-base font-medium">
                  {trx.memo}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {!isSingle && (
                  <>
                    <span
                      className={`flex items-center gap-1 font-medium ${trx.payer === "me" ? "text-blue-500" : "text-pink-500"}`}
                    >
                      <User className="w-3 h-3" />
                      {trx.payer === "me" ? myName : partnerName}
                    </span>
                    <span>•</span>
                  </>
                )}
                <span>
                  {format(
                    new Date(trx.transaction_date),
                    language === "ja" ? "yyyy/MM/dd" : "MMM d, yyyy",
                    { locale: language === "ja" ? ja : enUS },
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`font-bold whitespace-nowrap ${
                  trx.type === "deposit"
                    ? "text-blue-600"
                    : trx.type === "expense"
                      ? "text-red-600"
                      : "text-emerald-600"
                }`}
              >
                {trx.type === "expense" ? "-" : "+"}
                {trx.amount.toLocaleString()}
              </span>
              <button
                onClick={() => handleDelete(trx.id)}
                disabled={isPending}
                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 p-2 sm:p-0"
                title="削除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </li>
        ))}
        {filteredTransactions.length === 0 && (
          <p className="text-gray-500 text-center py-4 text-sm">
            表示する履歴がありません
          </p>
        )}
      </ul>
    </div>
  );
}
