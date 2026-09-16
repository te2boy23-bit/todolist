"use client";

import { useState, useTransition, useRef } from "react";
import { updateProfile } from "@/app/actions/profile";
import { User } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

type Profile = {
  id: string;
  name: string;
  avatar_url: string;
};

interface PairingModalProps {
  profile: Profile;
}

export function PairingModal({ profile }: PairingModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState(profile.name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fileName, setFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", displayName);
        formData.append("avatar_url", avatarUrl);
        await updateProfile(formData);
        setSuccess(t("common.save") + "!");
        setTimeout(() => {
          setSuccess("");
          setIsOpen(false);
        }, 1500);
      } catch (err) {
        setError("Error updating profile");
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
                {t("profile.settings")}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
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

              {/* Messages */}
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
