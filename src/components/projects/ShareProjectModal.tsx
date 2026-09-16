"use client";

import { useState } from "react";
import { Users, Copy, Check, X, UserPlus } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function ShareProjectModal({ project }: { project: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();

  if (!project) return null;

  const handleCopy = () => {
    const textToCopy = `ふたりの共有アプリに招待されました！✨\n\n招待コード: ${project.invite_code}\n\n▼ここからアプリを開いてログインし、招待コードを入力して参加してね！\n${window.location.origin}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isShared = !!project.partner_id;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors text-xs font-medium"
        title="共有設定"
      >
        <UserPlus className="w-4 h-4" />
        <span className="hidden sm:inline">共有</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  プロジェクトを共有
                </h2>
                <p className="text-sm text-gray-500 mt-2">{project.name}</p>
              </div>

              {isShared ? (
                <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto opacity-75" />
                  <p className="font-medium">このプロジェクトは共有済みです</p>
                  <p className="text-xs opacity-75">
                    パートナーと目標・支出・ToDoを共有しています。
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 text-center">
                    以下の招待コードをパートナーに教えて、プロジェクトに参加してもらいましょう。
                  </p>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex flex-col items-center gap-3">
                    <code className="text-4xl font-mono font-bold tracking-[0.2em] text-blue-600">
                      {project.invite_code}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-sm font-medium text-gray-700 shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-600">
                            コピーしました
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>招待メッセージをコピー</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
