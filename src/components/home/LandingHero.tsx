"use client";

import { useLanguage } from "@/components/i18n/LanguageProvider";
import { LoginButton } from "@/components/auth/LoginButton";
import { EmailAuthForm } from "@/components/auth/EmailAuthForm";
import Image from "next/image";

export function LandingHero() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="max-w-2xl w-full flex flex-col items-center">
        <div className="w-24 h-24 mb-6 rounded-2xl overflow-hidden shadow-sm relative border border-gray-100">
          <Image src="/logo.jpg" alt="App Logo" fill className="object-cover" />
        </div>
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

        <div className="flex flex-col items-center gap-4 w-full">
          <EmailAuthForm />

          <div className="flex items-center w-full max-w-sm my-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">
              または
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <LoginButton
            text={t("landing.loginBtn")}
            className="flex items-center gap-3 text-lg font-bold text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all w-full max-w-sm justify-center"
            iconSize={5}
          />

          <p className="text-sm text-gray-400 mt-2">{t("landing.freeNote")}</p>
        </div>
      </div>
    </div>
  );
}
