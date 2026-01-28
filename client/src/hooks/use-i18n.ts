/**
 * use-i18n Hook - Web Version
 * Piano Emotion Manager
 * 
 * Hook para internacionalización con persistencia en localStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/lib/trpc';

// Importar traducciones
import esTranslations from '../../../locales/es/translations.json';
import enTranslations from '../../../locales/en/translations.json';
import frTranslations from '../../../locales/fr/translations.json';
import deTranslations from '../../../locales/de/translations.json';
import itTranslations from '../../../locales/it/translations.json';
import ptTranslations from '../../../locales/pt/translations.json';
import daTranslations from '../../../locales/da/translations.json';
import noTranslations from '../../../locales/no/translations.json';
import svTranslations from '../../../locales/sv/translations.json';

export const translations = {
  es: esTranslations,
  en: enTranslations,
  fr: frTranslations,
  de: deTranslations,
  it: itTranslations,
  pt: ptTranslations,
  da: daTranslations,
  no: noTranslations,
  sv: svTranslations,
};

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
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Hook for internationalization with language persistence
 */
export function useI18n() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  const { data: userLanguageData } = trpc.language.getUserLanguage.useQuery(undefined, {
    enabled: false, // Solo cargar manualmente
  });

  const updateLanguageMutation = trpc.language.updateLanguage.useMutation();

  // Load saved language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

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
    const translation = getNestedValue(translations[currentLanguage], key);
    
    if (!translation) {
      console.warn(`[i18n] Missing translation for key: ${key} in language: ${currentLanguage}`);
      // Fallback to default language
      const fallback = getNestedValue(translations[defaultLanguage], key);
      if (fallback) {
        return interpolate(fallback, options);
      }
      return key;
    }

    return interpolate(translation, options);
  }, [currentLanguage]);

  /**
   * Check if translation exists
   */
  const hasTranslation = useCallback((key: string): boolean => {
    const translation = getNestedValue(translations[currentLanguage], key);
    return translation !== undefined;
  }, [currentLanguage]);

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
function interpolate(text: string, options?: Record<string, any>): string {
  if (!options) return text;
  
  let result = text;
  Object.keys(options).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(options[key]));
  });
  
  return result;
}
