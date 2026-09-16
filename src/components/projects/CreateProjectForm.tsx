"use client";

import { useTransition, useRef, useState, useEffect } from "react";
import { createProject } from "@/app/actions/project";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";

export function CreateProjectForm() {
  const { t, language } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isStartCalendarOpen, setIsStartCalendarOpen] = useState(false);
  const [isEndCalendarOpen, setIsEndCalendarOpen] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        startRef.current &&
        !startRef.current.contains(event.target as Node)
      ) {
        setIsStartCalendarOpen(false);
      }
      if (endRef.current && !endRef.current.contains(event.target as Node)) {
        setIsEndCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      alert("開始日と目標日を選択してください。");
      return;
    }

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
        alert(`プロジェクトの作成に失敗しました: ${error.message || "不明なエラー"}`);
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
        <div className="relative" ref={startRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            開始日
          </label>
          <input type="hidden" name="start_date" value={startDate} required />
          <button
            type="button"
            onClick={() => {
              setIsStartCalendarOpen(!isStartCalendarOpen);
              setIsEndCalendarOpen(false);
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left text-gray-700"
          >
            {startDate
              ? format(
                  new Date(startDate),
                  language === "ja" ? "yyyy年MM月dd日" : "MMM d, yyyy",
                  { locale: language === "ja" ? ja : enUS },
                )
              : "日付を選択"}
          </button>
          {isStartCalendarOpen && (
            <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
              <DayPicker
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setStartDate(format(date, "yyyy-MM-dd"));
                    setIsStartCalendarOpen(false);
                  }
                }}
                locale={language === "ja" ? ja : enUS}
                captionLayout="dropdown"
                startMonth={new Date(2020, 0)}
                endMonth={new Date(new Date().getFullYear() + 10, 11)}
              />
            </div>
          )}
        </div>
        <div className="relative" ref={endRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            目標（終了）日
          </label>
          <input type="hidden" name="end_date" value={endDate} required />
          <button
            type="button"
            onClick={() => {
              setIsEndCalendarOpen(!isEndCalendarOpen);
              setIsStartCalendarOpen(false);
            }}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-left text-gray-700"
          >
            {endDate
              ? format(
                  new Date(endDate),
                  language === "ja" ? "yyyy年MM月dd日" : "MMM d, yyyy",
                  { locale: language === "ja" ? ja : enUS },
                )
              : "日付を選択"}
          </button>
          {isEndCalendarOpen && (
            <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 right-0 sm:left-0">
              <DayPicker
                mode="single"
                selected={endDate ? new Date(endDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    setEndDate(format(date, "yyyy-MM-dd"));
                    setIsEndCalendarOpen(false);
                  }
                }}
                locale={language === "ja" ? ja : enUS}
                captionLayout="dropdown"
                startMonth={new Date(2020, 0)}
                endMonth={new Date(new Date().getFullYear() + 10, 11)}
              />
            </div>
          )}
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
