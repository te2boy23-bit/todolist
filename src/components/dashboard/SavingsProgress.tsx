"use client";

import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { User } from "lucide-react";

interface SavingsProgressProps {
  project?: any;
  currentAmount: number;
  myContribution: number;
  partnerContribution: number;
  myName: string;
  partnerName: string;
  isSingle?: boolean;
}

export function SavingsProgress({
  project,
  currentAmount,
  myContribution,
  partnerContribution,
  myName,
  partnerName,
  isSingle,
}: SavingsProgressProps) {
  const { t } = useLanguage();
  const targetAmount = project ? project.target_amount : 1500000;
  const startDate = parseISO(project ? project.start_date : "2026-12-20");
  const endDate = parseISO(project ? project.end_date : "2027-12-20");

  const { progress, remainingDays, totalDays, isStarted, isFinished } =
    useMemo(() => {
      const today = new Date();
      const total = differenceInDays(endDate, startDate);
      const remaining = differenceInDays(endDate, today);

      return {
        progress: Math.min(
          Math.max((currentAmount / targetAmount) * 100, 0),
          100,
        ),
        remainingDays: Math.max(remaining, 0),
        totalDays: total,
        isStarted: today >= startDate,
        isFinished: today >= endDate,
      };
    }, [currentAmount, targetAmount, startDate, endDate]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-4 gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            目標金額 ({targetAmount.toLocaleString()}
            {t("dashboard.currency")})
          </h2>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              {currentAmount.toLocaleString()}
            </span>
            <span className="text-gray-500 font-medium">
              {t("dashboard.currency")}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right">
          {isFinished ? (
            <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {t("dashboard.finished")}
            </span>
          ) : !isStarted ? (
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {t("dashboard.startsIn", {
                days: differenceInDays(startDate, new Date()),
              })}
            </span>
          ) : (
            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              {t("dashboard.remainingDays", { days: remainingDays })}
            </span>
          )}
        </div>
      </div>

      <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
        <div
          className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-400 font-medium mt-2 mb-6">
        <span>0{t("dashboard.currency")}</span>
        <span>
          {t("dashboard.achieved", { progress: progress.toFixed(1) })}
        </span>
        <span>
          {targetAmount.toLocaleString()}
          {t("dashboard.currency")}
        </span>
      </div>

      {/* Contributions */}
      {/* Contributions */}
      <div
        className={`grid gap-4 border-t pt-4 ${isSingle ? "grid-cols-1" : "grid-cols-2"}`}
      >
        <div className="bg-blue-50/50 rounded-lg p-3">
          <div className="text-xs text-blue-600 font-medium flex items-center gap-1 mb-1">
            <User className="w-3 h-3" />
            {isSingle ? "現在の貯金" : myName}
          </div>
          <div className="font-semibold text-gray-900">
            {myContribution.toLocaleString()}{" "}
            <span className="text-xs text-gray-500 font-normal">
              {t("dashboard.currency")}
            </span>
          </div>
        </div>
        {!isSingle && (
          <div className="bg-pink-50/50 rounded-lg p-3">
            <div className="text-xs text-pink-600 font-medium flex items-center gap-1 mb-1">
              <User className="w-3 h-3" />
              {partnerName}
            </div>
            <div className="font-semibold text-gray-900">
              {partnerContribution.toLocaleString()}{" "}
              <span className="text-xs text-gray-500 font-normal">
                {t("dashboard.currency")}
              </span>
            </div>
          </div>
        )}
      </div>

      {(project?.scheduledExpense > 0 || project?.scheduledDeposit > 0) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {project.scheduledDeposit > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 border border-emerald-100">
              <span>今後の貯金/収入予定:</span>
              <span>
                +{project.scheduledDeposit.toLocaleString()}{" "}
                {t("dashboard.currency")}
              </span>
            </div>
          )}
          {project.scheduledExpense > 0 && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full text-xs font-medium text-amber-700 border border-amber-100">
              <span>今後の支払い予定:</span>
              <span>
                -{project.scheduledExpense.toLocaleString()}{" "}
                {t("dashboard.currency")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
