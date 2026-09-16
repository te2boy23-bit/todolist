"use client";

import { useLanguage } from "./LanguageProvider";

export function Trans({ i18nKey }: { i18nKey: string }) {
  const { t } = useLanguage();
  return <>{t(i18nKey)}</>;
}
