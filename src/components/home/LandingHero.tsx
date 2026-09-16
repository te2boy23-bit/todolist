"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LoginButton } from "@/components/auth/LoginButton";

export function LandingHero() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
          {t("landing.titleLine1")}
          <br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">
            {t("landing.titleLine2")}
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl mx-auto">
          {t("landing.description")}
        </p>

        <div className="flex flex-col items-center gap-4">
          <LoginButton
            text={t("landing.loginBtn")}
            className="flex items-center gap-3 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto justify-center"
            iconSize={6}
          />
          <p className="text-sm text-gray-400">{t("landing.freeNote")}</p>
        </div>
      </div>
    </div>
  );
}
