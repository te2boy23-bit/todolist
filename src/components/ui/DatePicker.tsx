"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  name?: string;
  value?: string;
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export function DatePicker({
  name,
  value,
  onChange,
  placeholder,
  className = "",
  required = false,
}: DatePickerProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // value（文字列 yyyy-MM-dd）をDateオブジェクトに変換
  const selectedDate = value ? new Date(value) : undefined;

  const popoverRef = useRef<HTMLDivElement>(null);

  // ポップアップ外クリックで閉じる処理
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // ローカルタイムゾーンでの日付文字列を作成
      const dateString = format(date, "yyyy-MM-dd");
      if (onChange) {
        onChange(dateString);
      }
    } else {
      if (onChange) {
        onChange("");
      }
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={popoverRef}>
      {/* 隠しinput (form送信時のため) */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ""}
          required={required}
        />
      )}

      {/* 表示用ボタン */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-50 transition-colors"
      >
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <span className={selectedDate ? "text-gray-900" : "text-gray-500"}>
          {selectedDate
            ? format(
                selectedDate,
                language === "ja" ? "yyyy年MM月dd日" : "MMM d, yyyy",
                { locale: language === "ja" ? ja : enUS },
              )
            : placeholder || (language === "ja" ? "日付を選択" : "Select date")}
        </span>
      </button>

      {/* ポップアップカレンダー */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl p-3 right-0 sm:left-0 sm:right-auto">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            locale={language === "ja" ? ja : enUS}
            className="border-0"
          />
        </div>
      )}
    </div>
  );
}
