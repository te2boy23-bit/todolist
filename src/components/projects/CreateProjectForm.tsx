"use client";

import { useTransition, useRef, useState } from "react";
import { createProject } from "@/app/actions/project";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function CreateProjectForm() {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await createProject(formData);
        // ここには到達しない(redirectされるため)
      } catch (error: any) {
        // redirectは内部でエラーを投げるので、それはそのまま投げる
        if (error && error.message === "NEXT_REDIRECT") {
          throw error;
        }
        console.error(error);
        alert("プロジェクトの作成に失敗しました");
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          プロジェクト名
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="例: 結婚式資金、ハワイ旅行 など"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          目標金額 (円)
        </label>
        <input
          type="number"
          name="target_amount"
          required
          min="1"
          placeholder="例: 1500000"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input
            type="date"
            name="start_date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            目標（終了）日
          </label>
          <input
            type="date"
            name="end_date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        <Plus className="w-5 h-5" />
        {isPending ? "作成中..." : "プロジェクトを作成"}
      </button>
    </form>
  );
}
