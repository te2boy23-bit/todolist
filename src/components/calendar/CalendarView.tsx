"use client";

import { useState, useTransition } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Wallet, User, Trash2, CheckSquare } from "lucide-react";
import { deleteTransaction, toggleTodo, deleteTodo } from "@/app/actions";
import { TransactionForm } from "@/components/dashboard/TransactionForm";

type Transaction = {
  id: string;
  type: "income" | "deposit" | "expense";
  payer: "me" | "partner";
  amount: number;
  memo: string;
  transaction_date: string;
};

type Todo = {
  id: string;
  title: string;
  is_completed: boolean;
  due_date: string | null;
};

interface CalendarViewProps {
  transactions: Transaction[];
  todos?: Todo[];
  currentBalance: number;
  myName: string;
  partnerName: string;
}

export function CalendarView({
  transactions,
  todos = [],
  currentBalance,
  myName,
  partnerName,
}: CalendarViewProps) {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState<Date | undefined>(new Date());
  const [isPending, startTransition] = useTransition();

  const selectedDateStr = selected ? format(selected, "yyyy-MM-dd") : "";

  // 日付ごとのトランザクションをグループ化
  const groupedTransactions = transactions.reduce(
    (acc, trx) => {
      if (!acc[trx.transaction_date]) {
        acc[trx.transaction_date] = [];
      }
      acc[trx.transaction_date].push(trx);
      return acc;
    },
    {} as Record<string, Transaction[]>,
  );

  // 日付ごとのTodoをグループ化
  const groupedTodos = todos.reduce(
    (acc, todo) => {
      if (todo.due_date) {
        if (!acc[todo.due_date]) {
          acc[todo.due_date] = [];
        }
        acc[todo.due_date].push(todo);
      }
      return acc;
    },
    {} as Record<string, Todo[]>,
  );

  const dayTransactions = selectedDateStr
    ? groupedTransactions[selectedDateStr] || []
    : [];
  const dayTodos = selectedDateStr ? groupedTodos[selectedDateStr] || [] : [];

  const totalDeposit = dayTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = dayTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = dayTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = (id: string) => {
    const msg =
      language === "ja"
        ? "この記録を削除してもよろしいですか？"
        : "Are you sure you want to delete this record?";
    if (confirm(msg)) {
      startTransition(async () => {
        try {
          await deleteTransaction(id);
        } catch (error) {
          console.error("Failed to delete", error);
        }
      });
    }
  };

  const handleTodoToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await toggleTodo(id, currentStatus);
      } catch (error) {
        console.error("Failed to toggle todo", error);
      }
    });
  };

  const handleTodoDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const msg =
      language === "ja"
        ? "このTodoを削除してもよろしいですか？"
        : "Are you sure you want to delete this todo?";
    if (confirm(msg)) {
      startTransition(async () => {
        try {
          await deleteTodo(id);
        } catch (error) {
          console.error("Failed to delete todo", error);
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-md p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-blue-100 font-medium text-sm flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4" />
            {t("calendar.currentBalance")}
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {currentBalance.toLocaleString()}
            </span>
            <span className="text-blue-100 text-sm">
              {t("dashboard.currency")}
            </span>
          </div>
          <p className="text-xs text-blue-200 mt-1">
            {t("calendar.balanceDescription")}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Calendar Area */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-center h-fit">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={setSelected}
            locale={language === "ja" ? ja : enUS}
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(new Date().getFullYear() + 10, 11)}
            modifiers={{
              hasRecord: (date) => {
                const dStr = format(date, "yyyy-MM-dd");
                return !!groupedTransactions[dStr] || !!groupedTodos[dStr];
              },
            }}
            modifiersStyles={{
              hasRecord: { fontWeight: "bold", textDecoration: "underline" },
            }}
          />
        </div>

        {/* Details Area */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            {selected
              ? format(
                  selected,
                  language === "ja" ? "yyyy年MM月dd日" : "MMM d, yyyy",
                  { locale: language === "ja" ? ja : enUS },
                )
              : ""}
          </h3>

          <div className="mb-6">
            <TransactionForm
              myName={myName}
              partnerName={partnerName}
              initialDate={selectedDateStr || undefined}
            />
          </div>

          {dayTransactions.length === 0 && dayTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {t("calendar.noTransactions")}
            </p>
          ) : (
            <div className="space-y-8">
              {/* Todos Section */}
              {dayTodos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1">
                    <CheckSquare className="w-4 h-4" /> ToDo
                  </h4>
                  <ul className="space-y-2">
                    {dayTodos.map((todo) => (
                      <li
                        key={todo.id}
                        className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors cursor-pointer group"
                        onClick={() =>
                          handleTodoToggle(todo.id, todo.is_completed)
                        }
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={todo.is_completed}
                            readOnly
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
                          />
                          <span
                            className={
                              todo.is_completed
                                ? "text-gray-400 line-through"
                                : "text-gray-700 font-medium"
                            }
                          >
                            {todo.title}
                          </span>
                        </div>
                        <button
                          onClick={(e) => handleTodoDelete(e, todo.id)}
                          disabled={isPending}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2 sm:p-0 disabled:opacity-50"
                          title="削除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Transactions Section */}
              {dayTransactions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1">
                    <Wallet className="w-4 h-4" /> 入出金
                  </h4>
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 p-3 rounded-lg text-xs sm:text-sm mb-4">
                    <div className="text-emerald-600 font-medium text-center border-r">
                      {t("calendar.totalIncome")}
                      <br />
                      <span className="text-xs">+</span>
                      {totalIncome.toLocaleString()}
                    </div>
                    <div className="text-blue-600 font-medium text-center border-r">
                      {t("calendar.totalDeposit")}
                      <br />
                      <span className="text-xs">+</span>
                      {totalDeposit.toLocaleString()}
                    </div>
                    <div className="text-red-600 font-medium text-center">
                      {t("calendar.totalExpense")}
                      <br />
                      <span className="text-xs">-</span>
                      {totalExpense.toLocaleString()}
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {dayTransactions.map((trx) => (
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
                          <div
                            className={`flex items-center gap-1 text-xs font-medium ${trx.payer === "me" ? "text-blue-500" : "text-pink-500"}`}
                          >
                            <User className="w-3 h-3" />
                            {trx.payer === "me" ? myName : partnerName}
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
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
