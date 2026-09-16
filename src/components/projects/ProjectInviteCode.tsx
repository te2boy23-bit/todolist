"use client";

import { useState } from "react";
import { Copy, Check, Users } from "lucide-react";

export function ProjectInviteCode({ project }: { project: any }) {
  const [copied, setCopied] = useState(false);

  if (!project) return null;

  // すでにパートナーがいる場合は表示しない（あるいは参加者アイコンを出すなどしても良い）
  if (project.partner_id) {
    return (
      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
        <Users className="w-3.5 h-3.5" />
        パートナーと共有中
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(project.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-2 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
      <span className="text-gray-500 font-medium">招待コード:</span>
      <code className="font-mono font-bold tracking-widest text-blue-600">
        {project.invite_code}
      </code>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
        title="コピー"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
