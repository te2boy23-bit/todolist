import { redirect } from "next/navigation";
import { getProfile } from "@/app/actions/profile";

export default async function Home() {
  const profile = await getProfile();

  if (profile) {
    redirect("/projects");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
        Cohabitation Savings Tracker
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        パートナーと一緒にお金を管理し、同棲や結婚に向けた目標を達成するためのアプリです。
      </p>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-4">
          始めるには右上の「Googleでログイン」ボタンを押してください。
        </p>
      </div>
    </div>
  );
}
