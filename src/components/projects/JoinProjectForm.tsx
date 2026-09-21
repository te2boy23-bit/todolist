"use client";

import { useTransition, useState } from "react";
import { joinProject } from "@/app/actions/project";
import { Link2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useLanguage } from "@/components/i18n/LanguageProvider";

export function JoinProjectForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.length < 6) return;
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const result = await joinProject(inviteCode);
        if (result.success) {
          setSuccess("Success!");
          setInviteCode("");
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(result.error || "Error");
        }
      } catch (err) {
        console.error(err);
        setError("Error");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("project.codeLabel")}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            maxLength={6}
            placeholder={t("project.codePlaceholder")}
            className="flex-1 px-4 py-3 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest uppercase text-center"
          />
          <button
            type="submit"
            disabled={isPending || inviteCode.length < 6}
            className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Link2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-500">{success}</p>}
    </form>
  );
}
