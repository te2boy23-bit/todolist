import { getProjects } from "@/app/actions/project";
import { getProfile } from "@/app/actions/profile";
import { getMyTotalAssets } from "@/app/actions/assets";
import { redirect } from "next/navigation";
import { CreateProjectForm } from "@/components/projects/CreateProjectForm";
import { JoinProjectForm } from "@/components/projects/JoinProjectForm";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { TotalAssetsSummary } from "@/components/projects/TotalAssetsSummary";
import { getDictionary } from "@/lib/i18n/server";

export default async function ProjectsPage() {
  const profile = await getProfile();

  if (!profile) {
    redirect("/");
  }

  const projects = await getProjects();
  const assets = await getMyTotalAssets(profile.id, projects);
  const { t } = await getDictionary();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
      <TotalAssetsSummary assets={assets} />

      <div className="space-y-2">
        <h1 className="text-xl font-bold text-gray-900">
          {t("project.listTitle")}
        </h1>
        <p className="text-gray-500 text-sm">{t("project.listDesc")}</p>
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
            {t("project.createNew")}
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <CreateProjectForm />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {t("project.joinWithCode")}
          </h2>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-6">
              {t("project.joinDesc")}
            </p>
            <JoinProjectForm />
          </div>
        </div>
      </div>
    </div>
  );
}
