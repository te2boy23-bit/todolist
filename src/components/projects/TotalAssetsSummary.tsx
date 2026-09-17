import { Wallet, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";

export function TotalAssetsSummary({ assets }: { assets: any }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-md p-6 text-white mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="w-5 h-5 text-blue-100" />
        <h2 className="text-sm font-medium text-blue-100">
          総資産（全プロジェクト合計）
        </h2>
      </div>
      <div className="flex items-baseline gap-2 mb-6">
        <span className="text-4xl font-bold">
          {assets.balance.toLocaleString()}
        </span>
        <span className="text-blue-200">円</span>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-4">
        <div>
          <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            総収入
          </div>
          <div className="font-semibold">
            {assets.totalIncome.toLocaleString()}円
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
            <ArrowRightLeft className="w-3 h-3" />
            総貯金
          </div>
          <div className="font-semibold">
            {assets.totalDeposit.toLocaleString()}円
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-blue-100 text-xs mb-1">
            <TrendingDown className="w-3 h-3" />
            総出費
          </div>
          <div className="font-semibold">
            {assets.totalExpense.toLocaleString()}円
          </div>
        </div>
      </div>
    </div>
  );
}
