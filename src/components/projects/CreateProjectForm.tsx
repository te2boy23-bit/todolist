"use client";

import { useTransition, useRef, useState, useEffect } from "react";
import { createProject } from "@/app/actions/project";
import { Plus } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { useRouter } from "next/navigation";

export function CreateProjectForm() {
  const router = useRouter();
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
        const result = await createProject(formData);
        if (result && result.error) {
          alert(`エラー: ${result.error}`);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } catch (error: any) {
        console.error("Create project error:", error);
        alert(
          `プロジェクトの作成に失敗しました: ${error.message || "不明なエラー"}`,
        );
      }
    });
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("project.nameLabel")}
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder={t("project.namePlaceholder")}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("project.targetLabel")} ({t("dashboard.currency")})
        </label>
        <input
          type="number"
          name="target_amount"
          required
          min="0"
          step="1000"
          placeholder={t("project.targetPlaceholder")}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 開始日 */}
        <div className="relative" ref={startRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("project.startDate")}
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
        {/* 終了日 */}
        <div className="relative" ref={endRef}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("project.endDate")}
          </label>
          <input type="hidden" name="end_date" value={endDate} required />
          <button
            type="button"
            onClick={() => setIsEndCalendarOpen(!isEndCalendarOpen)}
            className="w-full text-left bg-white px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors"
          >
            {endDate ? (
              <span className="text-gray-900">
                {format(new Date(endDate), "yyyy/MM/dd")}
              </span>
            ) : (
              <span className="text-gray-400">YYYY/MM/DD</span>
            )}
          </button>
          {isEndCalendarOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2">
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
                endMonth={new Date(2050, 11)}
                className="bg-white"
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "hidden",
                  caption_dropdowns: "flex gap-2 items-center justify-center",
                  dropdown:
                    "p-1 bg-white border border-gray-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer hover:bg-gray-50",
                  dropdown_month: "ml-2",
                  dropdown_year: "mr-2",
                  nav: "space-x-1 flex items-center",
                  nav_button:
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell:
                    "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md transition-colors",
                  day_selected:
                    "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                  day_today: "bg-gray-100 text-gray-900",
                  day_outside: "text-gray-400 opacity-50",
                  day_disabled: "text-gray-400 opacity-50",
                  day_hidden: "invisible",
                }}
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
      >
        <Plus className="w-5 h-5" />
        {isPending ? t("common.loading") : t("project.createBtn")}
      </button>
    </form>
  );
}
