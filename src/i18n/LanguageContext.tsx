import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Locale, TranslationKey, translations } from './translations';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
  tx: (spanish: string, english: string) => string;
}

const STORAGE_KEY = 'anthony_portfolio_locale';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const readStoredLocale = (): Locale => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = translations[locale]['meta.title'];

    const metaDescription = document.querySelector('meta[name="description"]');
    metaDescription?.setAttribute('content', translations[locale]['meta.description']);

    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      return;
    }
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => (current === 'es' ? 'en' : 'es'));
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key],
    [locale]
  );

  const tx = useCallback(
    (spanish: string, english: string) => (locale === 'en' ? english : spanish),
    [locale]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, toggleLocale, t, tx }),
    [locale, setLocale, toggleLocale, t, tx]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
