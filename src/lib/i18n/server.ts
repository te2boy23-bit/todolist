import { cookies } from "next/headers";
import { dictionaries, Language } from "./dictionaries";

export async function getDictionary() {
  const cookieStore = await cookies();
  const lang = (cookieStore.get("app_lang")?.value as Language) || "ja";
  const dict = dictionaries[lang] || dictionaries.ja;

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = dict;

    for (const k of keys) {
      if (value[k] === undefined) {
        return key;
      }
      value = value[k];
    }

    if (typeof value !== "string") return key;

    let result = value;
    if (params) {
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(`{${paramKey}}`, String(params[paramKey]));
      });
    }

    return result;
  };

  return { t, lang };
}
