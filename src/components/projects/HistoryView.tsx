"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Filter,
  Wallet,
  ArrowDownCircle,
  PlusCircle,
  MinusCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

type FilterType = "all" | "income" | "deposit" | "expense";

export function HistoryView({ transactions }: { transactions: any[] }) {
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredTransactions = transactions.filter((trx) => {
    if (filter === "all") return true;
    return trx.type === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/projects"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">すべての履歴</h1>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <Filter className="w-5 h-5 text-gray-400 shrink-0 ml-1" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="bg-gray-50 border-none text-sm rounded-lg focus:ring-2 focus:ring-blue-500 py-2 px-3 font-medium outline-none"
        >
          <option value="all">すべて表示</option>
          <option value="income">収入のみ</option>
          <option value="deposit">貯金のみ</option>
          <option value="expense">出費のみ</option>
        </select>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            履歴がありません。
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredTransactions.map((trx) => (
              <li
                key={trx.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 font-medium">
                      {format(
                        new Date(trx.transaction_date),
                        "yyyy年MM月dd日",
                        { locale: ja },
                      )}
                    </span>
                    <span className="font-medium text-gray-800">
                      {trx.memo}
                    </span>
                    <span className="text-xs text-gray-500">
                      プロジェクト: {trx.projects?.name || "不明"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trx.type === "income" && (
                      <ArrowDownCircle className="w-4 h-4 text-emerald-500" />
                    )}
                    {trx.type === "deposit" && (
                      <PlusCircle className="w-4 h-4 text-blue-500" />
                    )}
                    {trx.type === "expense" && (
                      <MinusCircle className="w-4 h-4 text-red-500" />
                    )}
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
                      {trx.amount.toLocaleString()}円
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
