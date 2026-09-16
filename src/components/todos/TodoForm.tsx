"use client";

import { useState } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { addTodo } from "@/app/actions";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { DatePicker } from "@/components/ui/DatePicker";

export function TodoForm() {
  const { t } = useLanguage();
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await addTodo({
        title,
        due_date: dueDate || null,
      });
      setTitle("");
      setDueDate("");
    } catch (error) {
      console.error("Failed to add todo", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 mb-6"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("todo.addNew")}
        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isSubmitting}
      />
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-48">
          <DatePicker
            value={dueDate}
            onChange={setDueDate}
            placeholder={t("common.calendar")}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 disabled:bg-blue-300 w-full sm:w-auto"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <PlusCircle className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}
