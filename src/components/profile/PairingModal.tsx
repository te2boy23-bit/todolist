"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { updateProfile } from "@/app/actions/profile";
import { User, Check, X } from "lucide-react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";

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

  // Crop states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
      });
      reader.readAsDataURL(file);
      
      // Reset input value so the same file can be selected again
      e.target.value = '';
    }
  };

  const handleCropSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      startTransition(async () => {
        setError("");
        
        // クロップした画像をBlobとして取得
        const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        if (!croppedImageBlob) throw new Error("Failed to crop image");

        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // 拡張子は元のファイルから適当に類推するか、jpeg固定にする
        const fileExt = "jpg"; 
        const uploadedName = `${profile.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(uploadedName, croppedImageBlob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(uploadedName);

        setAvatarUrl(data.publicUrl);
        setImageSrc(null); // クロップ画面を閉じる
      });
    } catch (error) {
      console.error("Upload error:", error);
      setError("Upload Failed");
      setImageSrc(null);
    }
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
      {/* メインのプロフィール設定モーダル */}
      {isOpen && !imageSrc && (
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
                          onChange={handleFileChange}
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

      {/* クロップ用モーダル */}
      {imageSrc && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col">
          <div className="flex justify-between items-center p-4 bg-black/50 text-white z-10">
            <button
              onClick={() => setImageSrc(null)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="font-medium">画像の切り抜き</span>
            <button
              onClick={handleCropSave}
              disabled={isPending}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-blue-400"
            >
              {isPending ? (
                <span className="text-sm">保存中...</span>
              ) : (
                <Check className="w-6 h-6" />
              )}
            </button>
          </div>
          
          <div className="relative flex-1">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          
          <div className="p-6 bg-black/50 flex flex-col items-center gap-4 z-10">
            <span className="text-white text-sm">ズーム調整</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="Zoom"
              onChange={(e) => {
                setZoom(Number(e.target.value))
              }}
              className="w-full max-w-sm accent-blue-500"
            />
          </div>
        </div>
      )}
    </>
  );
}
