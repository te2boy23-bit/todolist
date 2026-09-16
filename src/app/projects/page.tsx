import { getProjects, selectProject } from "@/app/actions/project";
import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { Wallet, Calendar } from "lucide-react";
import { format } from "date-fns";

export default async function ProjectsPage() {
  const profile = await getProfile();

  if (!profile) {
    // 未ログインの場合はダッシュボード（ログインを促す画面）にリダイレクト
    redirect("/");
  }

  const projects = await getProjects();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">プロジェクト一覧</h1>
        <p className="text-gray-500 text-sm">
          管理する目標（結婚資金、旅行など）を選択するか、新しく作成してください。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project: any) => (
          <form key={project.id} action={selectProject.bind(null, project.id)}>
            <button
              type="submit"
              className="w-full text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
                {project.name}
              </h2>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  <span>目標: {project.target_amount.toLocaleString()}円</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>
                    期間: {format(new Date(project.start_date), "yyyy/MM/dd")}{" "}
                    〜 {format(new Date(project.end_date), "yyyy/MM/dd")}
                  </span>
                </div>
              </div>
            </button>
          </form>
        ))}
      </div>

      <hr className="border-gray-200" />

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">新しく作成する</h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}
