import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export function TotalAssetsSummary({ assets }: { assets: any }) {
  return (
    <Link href="/assets/history" className="block mb-8 group">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white transition-transform transform group-hover:scale-[1.01] relative overflow-hidden">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity">
          <ChevronRight className="w-6 h-6" />
        </div>

        <div className="flex items-center gap-2 mb-2 relative z-10">
          <Wallet className="w-5 h-5 text-blue-100" />
          <h2 className="text-sm font-medium text-blue-100">
            手持ち残高（未割り当て）
          </h2>
        </div>
        <div className="flex items-baseline gap-2 mb-2 relative z-10">
          <span className="text-4xl font-bold">
            {assets.balance.toLocaleString()}
          </span>
          <span className="text-blue-200">円</span>
        </div>

        {assets.scheduledExpense > 0 && (
          <div className="mb-6 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-xs font-medium text-amber-200">
            <span>後払い枠（未払い額）:</span>
            <span>-{assets.scheduledExpense.toLocaleString()} 円</span>
          </div>
        )}
        {assets.scheduledExpense === 0 && <div className="mb-6" />}

        <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-4 relative z-10 pr-6">
          <div>
            <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
              <TrendingUp className="w-3 h-3" />
              総収入
            </div>
            <div className="font-semibold text-sm sm:text-base">
              {assets.totalIncome.toLocaleString()}円
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
              <ArrowRightLeft className="w-3 h-3" />
              総貯金
            </div>
            <div className="font-semibold text-sm sm:text-base">
              {assets.totalDeposit.toLocaleString()}円
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
              <TrendingDown className="w-3 h-3" />
              総出費
            </div>
            <div className="font-semibold text-sm sm:text-base">
              {assets.totalExpense.toLocaleString()}円
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
