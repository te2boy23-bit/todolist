import { getProjects } from "@/app/actions/project";
import { getProfile } from "@/app/actions/profile";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { JoinProjectForm } from "@/components/projects/JoinProjectForm";
import { ProjectCard } from "@/components/projects/ProjectCard";

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
        <h1 className="text-xl font-bold text-gray-900">プロジェクト一覧</h1>
        <p className="text-gray-500 text-sm">
          管理する目標（結婚資金、旅行など）を選択するか、新しく作成・参加してください。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project: any) => (
          <ProjectCard
            key={project.id}
            project={project}
            currentUserId={profile.id}
          />
        ))}
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            新しく作成する
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <CreateProjectForm />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            招待コードで参加
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-6">
              パートナーから教えてもらった6桁の招待コードを入力して、プロジェクトに参加します。
            </p>
            <JoinProjectForm />
          </div>
        </div>
      </div>
    </div>
  );
}
