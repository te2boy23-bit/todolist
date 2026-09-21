"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Users, Copy, Check, X, UserPlus } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

export function ShareProjectModal({
  project,
  variant = "default",
}: {
  project: any;
  variant?: "default" | "icon";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!project) return null;

  const handleCopy = () => {
    const textToCopy = `プロジェクトに招待されました！✨\n\n招待コード: ${project.invite_code}\n\n▼ここからアプリを開いてログインし、招待コードを入力して参加してね！\nhttps://plan-wallet.com/`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isShared = !!project.partner_id;

  return (
    <>
      {variant === "icon" ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          title="共有設定"
        >
          <UserPlus className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-1.5 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 px-3 py-2 rounded-md transition-colors text-xs font-medium shrink-0"
          title="共有設定"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">共有</span>
        </button>
      )}

      {mounted &&
        isOpen &&
        createPortal(
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    プロジェクトの共有
                  </h3>
                  <p className="text-sm text-gray-500">
                    以下の招待コードを友人や恋人に教えて、プロジェクトに参加してもらいましょう。
                  </p>
                </div>

                {isShared ? (
                  <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-100">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">共有済みです</p>
                    <p className="text-sm text-gray-500">
                      すでにパートナーが参加しています。
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-black text-blue-600 tracking-wider">
                        {project.invite_code}
                      </div>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition-all"
                    >
                      {copied ? (
                        <>
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="text-green-600">
                            コピーしました！
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-5 h-5" />
                          <span>招待メッセージをコピー</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
