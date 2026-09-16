"use client";

import { useState, useTransition, useRef } from "react";
import { updateProfile, pairWithPartner } from "@/app/actions/profile";
import { User, Copy, Check, Link as LinkIcon, Camera } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type Profile = {
  id: string;
  display_name: string;
  avatar_url: string;
  invite_code: string;
  partner_id: string | null;
};

interface PairingModalProps {
  profile: Profile;
}

export function PairingModal({ profile }: PairingModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "pairing">("profile");
  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [inviteCodeInput, setInviteCodeInput] = useState("");

  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = () => {
    startTransition(async () => {
      try {
        await updateProfile(displayName, avatarUrl);
        setSuccess(t("common.save") + "!");
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        setError("Error");
      }
    });
  };

  const handlePairing = () => {
    if (!inviteCodeInput.trim()) return;
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        await pairWithPartner(inviteCodeInput.trim().toUpperCase());
        setSuccess(t("profile.paired"));
        setTimeout(() => setIsOpen(false), 2000);
      } catch (err: any) {
        setError("Error");
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors overflow-hidden border border-gray-200"
      >
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-4 h-4 text-gray-500" />
        )}
      </button>
    );
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {t("profile.title")}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 w-full">
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("profile")}
              >
                {t("profile.settings")}
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium ${activeTab === "pairing" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:bg-gray-50"}`}
                onClick={() => setActiveTab("pairing")}
              >
                {t("profile.inviteSection")}
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* プロフィール設定セクション */}
              {activeTab === "profile" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                    <div className="relative group flex-shrink-0">
                      <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t("profile.displayName")}
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={t("profile.namePlaceholder")}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {t("profile.avatar")}
                        </label>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) {
                                setFileName("");
                                return;
                              }

                              setFileName(file.name);
                              setError("");
                              startTransition(async () => {
                                try {
                                  const { createClient } =
                                    await import("@/lib/supabase/client");
                                  const supabase = createClient();

                                  const fileExt = file.name.split(".").pop();
                                  const uploadedName = `${profile.id}-${Math.random()}.${fileExt}`;

                                  const { error: uploadError } =
                                    await supabase.storage
                                      .from("avatars")
                                      .upload(uploadedName, file);

                                  if (uploadError) throw uploadError;

                                  const { data } = supabase.storage
                                    .from("avatars")
                                    .getPublicUrl(uploadedName);

                                  setAvatarUrl(data.publicUrl);
                                } catch (error) {
                                  console.error("Upload error:", error);
                                  setError("Upload Failed");
                                }
                              });
                            }}
                          />
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
                          >
                            {t("profile.chooseFile")}
                          </button>
                          <span className="text-xs text-gray-500 truncate max-w-[120px]">
                            {fileName || t("profile.noFileChosen")}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isPending}
                        className="w-full sm:w-auto text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2 block"
                      >
                        {t("profile.save")}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* パートナー連携セクション */}
              {activeTab === "pairing" && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {profile.partner_id ? (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <LinkIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {t("profile.paired")}
                        </p>
                        <p className="text-xs opacity-80">
                          {t("profile.pairedDesc")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">
                        {t("profile.inviteDesc")}
                      </p>

                      <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200">
                        <p className="text-xs font-medium text-gray-500">
                          {t("profile.yourCode")}
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 bg-white px-3 py-2 border border-gray-200 rounded-lg font-mono text-lg text-center tracking-widest font-bold text-gray-800">
                            {profile.invite_code}
                          </code>
                          <button
                            onClick={handleCopy}
                            className="p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                          >
                            {copied ? (
                              <Check className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Copy className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-2">
                          {t("profile.tellCode")}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 my-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs font-medium text-gray-400">
                          {t("profile.or")}
                        </span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500">
                          {t("profile.enterCode")}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={inviteCodeInput}
                            onChange={(e) =>
                              setInviteCodeInput(e.target.value.toUpperCase())
                            }
                            placeholder="ABCDEF"
                            maxLength={6}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                          />
                          <button
                            onClick={handlePairing}
                            disabled={isPending || inviteCodeInput.length < 6}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {t("profile.pairBtn")}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Messages outside tabs */}
              <div className="mt-4">
                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}
                {success && (
                  <p className="text-sm text-emerald-500 text-center">
                    {success}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
