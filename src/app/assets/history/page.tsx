import { getProfile } from "@/app/actions/profile";
import { getProjects } from "@/app/actions/project";
import { getAllTransactions } from "@/app/actions/assets";
import { redirect } from "next/navigation";
import { HistoryView } from "@/components/projects/HistoryView";

export default async function AssetsHistoryPage() {
  const profile = await getProfile();
  if (!profile) redirect("/");

  const projects = await getProjects();
  const transactions = await getAllTransactions(profile.id, projects);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <HistoryView transactions={transactions} />
    </div>
  );
}
