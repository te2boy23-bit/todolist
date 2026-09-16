import { TodosHeader } from "@/components/todos/TodosHeader";
import { TodoForm } from "@/components/todos/TodoForm";
import { TodoList } from "@/components/todos/TodoList";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProject } from "@/app/actions/project";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FolderKanban } from "lucide-react";

export default async function TodosPage() {
  const project = await getCurrentProject();

  if (!project) {
    redirect("/projects");
  }

  let todos: any[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (data) {
      todos = data;
    }
  } catch (error) {
    console.error("Supabase fetch error, using empty data", error);
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5" />
            プロジェクト一覧に戻る
          </Link>
          <TodosHeader />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <TodoForm />
          <TodoList todos={todos} />
        </div>
      </div>
    </div>
  );
}
