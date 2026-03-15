"use client";

import { useState, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LANGUAGES, Language } from "@/lib/i18n/translations";

const STORAGE_KEY = "apomuden_language";

export function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && LANGUAGES.some(l => l.code === stored)) {
      setCurrentLang(stored);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }));
  };

  const currentLanguage = LANGUAGES.find(l => l.code === currentLang);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-2">
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">EN</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage?.nativeName || "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>
              {lang.nativeName}
              {lang.code !== "en" && (
                <span className="text-gray-400 text-sm ml-2">({lang.name})</span>
              )}
            </span>
            {currentLang === lang.code && (
              <Check className="h-4 w-4 text-emerald-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Hook to use translations
export function useTranslation() {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored) setLang(stored);

    const handleChange = (e: CustomEvent<Language>) => {
      setLang(e.detail);
    };

    window.addEventListener("languageChange", handleChange as EventListener);
    return () => {
      window.removeEventListener("languageChange", handleChange as EventListener);
    };
  }, []);

  return lang;
}
