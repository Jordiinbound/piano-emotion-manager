/**
 * use-i18n Hook - Web Version with Lazy Loading
 * Piano Emotion Manager
 * 
 * Hook para internacionalización con carga lazy de traducciones
 * y persistencia en localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

export type SupportedLanguage = 'es' | 'en' | 'fr' | 'de' | 'it' | 'pt' | 'da' | 'no' | 'sv';

export const supportedLanguages = [
  { code: 'es' as SupportedLanguage, name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr' as SupportedLanguage, name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de' as SupportedLanguage, name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it' as SupportedLanguage, name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt' as SupportedLanguage, name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'da' as SupportedLanguage, name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'no' as SupportedLanguage, name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'sv' as SupportedLanguage, name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
];

export const defaultLanguage: SupportedLanguage = 'es';

const LANGUAGE_STORAGE_KEY = 'piano_emotion_language';

// Cache de traducciones cargadas
const translationsCache: Record<SupportedLanguage, Record<string, string> | null> = {
  es: null,
  en: null,
  fr: null,
  de: null,
  it: null,
  pt: null,
  da: null,
  no: null,
  sv: null,
};

/**
 * Cargar traducciones de forma lazy
 */
async function loadTranslations(language: SupportedLanguage): Promise<Record<string, string>> {
  // Si ya está en caché, devolverlo
  if (translationsCache[language]) {
    return translationsCache[language]!;
  }

  try {
    // Cargar dinámicamente el archivo de traducción
    const translations = await import(`../../../locales/${language}/translations.json`);
    const translationsData = translations.default || translations;
    // Flatten nested translations object
    const flattened = flattenTranslations(translationsData);
    translationsCache[language] = flattened;
    return translationsCache[language]!;
  } catch (error) {
    console.error(`[i18n] Error loading translations for ${language}:`, error);
    
    // Si falla, intentar cargar el idioma por defecto
    if (language !== defaultLanguage) {
      return loadTranslations(defaultLanguage);
    }
    
    return {};
  }
}

/**
 * Get browser language
 */
function getBrowserLanguage(): SupportedLanguage {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    const supported = supportedLanguages.find(lang => lang.code === browserLang);
    if (supported) {
      return supported.code;
    }
  }
  return defaultLanguage;
}

/**
 * Hook for internationalization with lazy loading and language persistence
 */
export function useI18n() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  const { data: userLanguageData } = trpc.language.getUserLanguage.useQuery(undefined, {
    enabled: false, // Solo cargar manualmente
  });

  const updateLanguageMutation = trpc.language.updateLanguage.useMutation();

  // Load saved language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  // Load translations when language changes
  useEffect(() => {
    loadLanguageTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadSavedLanguage = async () => {
    try {
      // Priority: Backend > Local Storage > Browser > Default
      let selectedLanguage = defaultLanguage;

      // Try backend first (if authenticated)
      if (userLanguageData?.language) {
        selectedLanguage = userLanguageData.language as SupportedLanguage;
      } else {
        // Try localStorage
        const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
          selectedLanguage = savedLanguage as SupportedLanguage;
        } else {
          // Use browser language
          selectedLanguage = getBrowserLanguage();
        }
      }

      setCurrentLanguage(selectedLanguage);
    } catch (error) {
      console.error('[i18n] Error loading language:', error);
      setCurrentLanguage(getBrowserLanguage());
    }
  };

  const loadLanguageTranslations = async (language: SupportedLanguage) => {
    try {
      setIsLoading(true);
      const loadedTranslations = await loadTranslations(language);
      setTranslations(loadedTranslations);
    } catch (error) {
      console.error('[i18n] Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (language: SupportedLanguage) => {
    try {
      // Save locally first for immediate UI update
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setCurrentLanguage(language);

      // Try to save to backend (if authenticated)
      try {
        await updateLanguageMutation.mutateAsync({ language });
      } catch (backendError) {
        // User not authenticated or backend error - local storage is enough
        console.log('[i18n] Could not save language to backend:', backendError);
      }
    } catch (error) {
      console.error('[i18n] Error changing language:', error);
    }
  }, [updateLanguageMutation]);

  /**
   * Translate function with interpolation support
   */
  const t = useCallback((key: string, options?: Record<string, any>): string => {
    const translation = translations[key];
    
    if (!translation) {
      console.warn(`[i18n] Missing translation for key: ${key} in language: ${currentLanguage}`);
      return key;
    }

    return interpolate(translation, options);
  }, [translations, currentLanguage]);

  /**
   * Check if translation exists
   */
  const hasTranslation = useCallback((key: string): boolean => {
    return translations[key] !== undefined;
  }, [translations]);

  /**
   * Get current language info
   */
  const currentLanguageInfo = supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];

  return {
    t,
    currentLanguage,
    currentLanguageInfo,
    changeLanguage,
    supportedLanguages,
    isLoading,
    hasTranslation,
  };
}

/**
 * Interpolate variables in translation string
 */
/**
 * Flatten nested translations object to dot notation
 */
function flattenTranslations(obj: any, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTranslations(value, newKey));
    } else {
      result[newKey] = String(value);
    }
  }
  
  return result;
}

/**
 * Interpolate variables in translation string
 */
function interpolate(text: string, options?: Record<string, any>): string {
  if (!options) return text;
  
  let result = text;
  Object.keys(options).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(options[key]));
  });
  
  return result;
}
