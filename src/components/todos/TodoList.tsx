"use client";

import { useTransition, useState } from "react";
import { toggleTodo, deleteTodo, updateTodo } from "@/app/actions";
import { Trash2, Calendar, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/DatePicker";
import { useCelebration } from "@/components/layout/CelebrationProvider";

type Todo = {
  id: string;
  title: string;
  is_completed: boolean;
  due_date: string | null;
};

export function TodoList({ todos }: { todos: Todo[] }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const { triggerCelebration } = useCelebration();

  const handleToggle = (id: string, currentStatus: boolean) => {
    if (editingId === id) return; // 編集中はトグルしない
    startTransition(async () => {
      try {
        await toggleTodo(id, currentStatus);
        if (!currentStatus) {
          triggerCelebration(); // 完了時に紙吹雪
        }
      } catch (error) {
        console.error("Failed to toggle todo", error);
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await deleteTodo(id);
      } catch (error) {
        console.error("Failed to delete todo", error);
      }
    });
  };

  const startEditing = (e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation();
    setEditingId(todo.id);
    setEditTitle(todo.title);
    setEditDueDate(todo.due_date || "");
  };

  const cancelEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const saveEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!editTitle.trim()) return;

    startTransition(async () => {
      try {
        await updateTodo(id, {
          title: editTitle,
          due_date: editDueDate || null,
        });
        setEditingId(null);
      } catch (error) {
        console.error("Failed to update todo", error);
      }
    });
  };

  const activeTodos = todos.filter((t) => !t.is_completed);
  const completedTodos = todos.filter((t) => t.is_completed);

  if (todos.length === 0) {
    return <p className="text-gray-500 text-center py-4">Todoがありません</p>;
  }

  const renderTodoItem = (todo: Todo) => {
    const isEditing = editingId === todo.id;

    if (isEditing) {
      return (
        <li
          key={todo.id}
          className="flex flex-col gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100"
        >
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          />
          <div className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
            <div className="w-full sm:w-48">
              <DatePicker
                value={editDueDate}
                onChange={setEditDueDate}
                placeholder="期限日なし"
              />
            </div>
            <div className="flex gap-2 justify-end mt-2 sm:mt-0">
              <button
                onClick={cancelEditing}
                className="p-2 text-gray-500 hover:bg-gray-200 rounded-md transition-colors"
                title="キャンセル"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => saveEdit(e, todo.id)}
                disabled={isPending || !editTitle.trim()}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                <Check className="w-4 h-4" />
                保存
              </button>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li
        key={todo.id}
        className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors cursor-pointer group"
        onClick={() => handleToggle(todo.id, todo.is_completed)}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={todo.is_completed}
            readOnly
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer pointer-events-none"
          />
          <div className="flex flex-col">
            <span
              className={
                todo.is_completed
                  ? "text-gray-400 line-through"
                  : "text-gray-700 font-medium"
              }
            >
              {todo.title}
            </span>
            {todo.due_date && (
              <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Calendar className="w-3 h-3" />
                {format(new Date(todo.due_date), "yyyy/MM/dd")}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 transition-opacity">
          <button
            onClick={(e) => startEditing(e, todo)}
            disabled={isPending}
            className="text-gray-400 hover:text-blue-500 p-2 disabled:opacity-50"
            title="編集"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleDelete(e, todo.id)}
            disabled={isPending}
            className="text-gray-400 hover:text-red-500 p-2 disabled:opacity-50"
            title="削除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      {/* 未完了のTodo */}
      {activeTodos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
            未完了 ({activeTodos.length})
          </h3>
          <ul className="space-y-2">{activeTodos.map(renderTodoItem)}</ul>
        </div>
      )}

      {/* 完了済みのTodo */}
      {completedTodos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1 border-t pt-4">
            完了済み ({completedTodos.length})
          </h3>
          <ul className="space-y-2 opacity-75">
            {completedTodos.map(renderTodoItem)}
          </ul>
        </div>
      )}
    </div>
  );
}
