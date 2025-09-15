"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = 'en' | 'hi' | 'ml';

type LocalizationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string, defaultText: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
    en: {
        welcome: "Welcome",
    },
    hi: {
        welcome: "आपका स्वागत है",
    },
    ml: {
        welcome: "സ്വാഗതം",
    }
};

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language | null;
    if (storedLang && ['en', 'hi', 'ml'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const translate = (key: string, defaultText: string): string => {
    return translations[language]?.[key] || defaultText;
  }

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
}
