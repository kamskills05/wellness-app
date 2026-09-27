import React, { createContext, useContext, useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { es, enUS, fr, eu } from "date-fns/locale";
import { STRINGS } from "@/lib/strings";
import useMe from "@/hooks/useMe";
import { auth } from "@/api/auth";

export const LANGUAGES = [
  { code: "es", label: "Español", short: "ES" },
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "eu", label: "Euskara", short: "EU" },
];
const LOCALES = { es, en: enUS, fr, eu };
const LangContext = createContext(null);

export function LanguageProvider({ children }) {
  const { data: me } = useMe();
  const [lang, setLangState] = useState(localStorage.getItem("lang") || "es");

  useEffect(() => {
    if (me?.language_preference) setLangState(me.language_preference);
  }, [me?.language_preference]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setLang = (code) => {
    setLangState(code);
    auth.updateMe({ language_preference: code });
  };
  const t = (key) => STRINGS[key]?.[lang] || STRINGS[key]?.es || key;
  const tr = (obj) => (obj && (obj[lang] || obj.es)) || "";
  const fmt = (d, pattern = "d MMM yyyy") => (d ? format(new Date(d), pattern, { locale: LOCALES[lang] }) : "");
  const ago = (d) => formatDistanceToNow(new Date(d), { addSuffix: true, locale: LOCALES[lang] });

  return <LangContext.Provider value={{ lang, setLang, t, tr, fmt, ago }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);