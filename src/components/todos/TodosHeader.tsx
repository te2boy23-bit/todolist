"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { CheckSquare } from "lucide-react";

export function TodosHeader() {
  const { t } = useLanguage();

  return (
    <header className="mb-10 text-center">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center justify-center gap-3">
        <CheckSquare className="w-8 h-8 text-blue-500" />
        {t("todo.title")}
      </h1>
    </header>
  );
}
