"use client";

import { useState, useRef, useEffect } from "react";
import {
  PlusCircle,
  MinusCircle,
  Loader2,
  ArrowDownCircle,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { addTransaction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";

type TransactionType = "income" | "deposit" | "expense";
type PayerType = "me" | "partner";

interface TransactionFormProps {
  myName: string;
  partnerName: string;
  initialDate?: string;
}

export function TransactionForm({ myName, partnerName, initialDate }: TransactionFormProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [type, setType] = useState<TransactionType>("deposit");
  const [payer, setPayer] = useState<PayerType>("me");
  const [amount, setAmount] = useState<string>("");
  const [memo, setMemo] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<string>(
    initialDate || new Date().toISOString().split("T")[0],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // initialDateが変更されたらステートを更新する
  useEffect(() => {
    if (initialDate) {
      setTransactionDate(initialDate);
    }
  }, [initialDate]);

  // 外側をクリックしたらカレンダーを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        payer,
        amount: Number(amount),
        memo,
        transaction_date: transactionDate,
      });

      setAmount("");
      setMemo("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      router.refresh();
    } catch (error: any) {
      console.error("Failed to add transaction", error);
      alert(`エラーが発生しました: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-2xl mx-auto mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {type === "deposit" ? (
            <PlusCircle className="w-5 h-5 text-blue-500" />
          ) : type === "expense" ? (
            <MinusCircle className="w-5 h-5 text-red-500" />
          ) : (
            <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
          )}
          {t("transaction.newTransaction")}
        </h3>

        {/* Payer Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 font-medium">
            {t("transaction.whoPaid")}
          </span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setPayer("me")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                payer === "me"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <User className="w-4 h-4" />
              {myName}
            </button>
            <button
              type="button"
              onClick={() => setPayer("partner")}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                payer === "partner"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              <User className="w-4 h-4" />
              {partnerName}
            </button>
          </div>
        </div>
      </div>

      {/* Type Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-4 w-full sm:w-fit">
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            type === "income"
              ? "bg-white text-emerald-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {t("transaction.income")}
        </button>
        <button
          type="button"
          onClick={() => setType("deposit")}
          className={cn(
            "flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            type === "deposit"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {t("transaction.deposit")}
        </button>
        <button
          type="button"
          onClick={() => setType("expense")}
          className={cn(
            "flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
            type === "expense"
              ? "bg-white text-red-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {t("transaction.expense")}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-1/3 relative" ref={containerRef}>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              disabled={isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition-all text-left bg-white",
                type === "deposit"
                  ? "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  : type === "expense"
                    ? "border-gray-200 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-200",
              )}
            >
              {transactionDate ? format(new Date(transactionDate), language === "ja" ? "yyyy年MM月dd日" : "MMM d, yyyy", { locale: language === "ja" ? ja : enUS }) : "日付を選択"}
            </button>
            {isCalendarOpen && (
              <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <DayPicker
                  mode="single"
                  selected={new Date(transactionDate)}
                  onSelect={(date) => {
                    if (date) {
                      setTransactionDate(format(date, "yyyy-MM-dd"));
                      setIsCalendarOpen(false);
                    }
                  }}
                  locale={language === "ja" ? ja : enUS}
                />
              </div>
            )}
          </div>
          <div className="w-full sm:w-1/3 relative">
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t("transaction.amountPlaceholder")}
              className={cn(
                "w-full pl-4 pr-12 py-3 rounded-lg border focus:ring-2 outline-none transition-all",
                type === "deposit"
                  ? "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  : type === "expense"
                    ? "border-gray-200 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-200",
              )}
              required
              disabled={isSubmitting}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              {t("dashboard.currency")}
            </span>
          </div>
          <div className="w-full sm:w-1/3">
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={t("transaction.memoPlaceholder")}
              className={cn(
                "w-full px-4 py-3 rounded-lg border focus:ring-2 outline-none transition-all",
                type === "deposit"
                  ? "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                  : type === "expense"
                    ? "border-gray-200 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-200",
              )}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !amount}
          className={cn(
            "text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center min-w-[120px]",
            type === "deposit"
              ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
              : type === "expense"
                ? "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
                : "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300",
          )}
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            t("transaction.submit")
          )}
        </button>
      </form>
    </div>
  );
}
