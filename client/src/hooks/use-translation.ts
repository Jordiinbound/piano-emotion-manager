/**
 * Hook de traducción
 * Wrapper sobre useLanguage para compatibilidad con componentes que usan useTranslation
 * 
 * IMPORTANTE: Este hook usa importaciones estáticas para garantizar que las traducciones
 * funcionen correctamente en producción.
 */

import { useLanguage } from '@/contexts/language-context';
import { translations, defaultLanguage } from '../../../locales';

/**
 * Función de traducción fallback que navega por el objeto de traducciones
 */
function translateFallback(key: string, options?: Record<string, any>): string {
  const locale = defaultLanguage;
  const keys = key.split('.');
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Retornar la clave si no se encuentra traducción
    }
  }
  
  if (typeof value === 'string') {
    // Reemplazar variables en el texto
    if (options) {
      return value.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
        return options[varName] !== undefined ? String(options[varName]) : `{{${varName}}}`;
      });
    }
    return value;
  }
  
  return key;
}

/**
 * Hook de traducción principal
 * Intenta usar el contexto de idioma, si no está disponible usa el fallback
 */
export function useTranslation() {
  try {
    // Intentar usar el contexto de idioma
    const context = useLanguage();
    
    return {
      t: context.t,
      i18n: {
        language: context.currentLanguage,
        changeLanguage: context.changeLanguage,
      },
    };
  } catch (error) {
    // Si el contexto no está disponible (componente fuera del provider),
    // usar el fallback con traducciones reales
    return {
      t: translateFallback,
      i18n: {
        language: defaultLanguage,
        changeLanguage: async (_lang: string) => {
          console.warn('useTranslation: LanguageProvider not found, language change ignored');
        },
      },
    };
  }
}

/**
 * Función de traducción standalone para uso fuera de componentes React
 * Usa el fallback directamente
 */
export function t(key: string, options?: Record<string, any>): string {
  return translateFallback(key, options);
}

export default useTranslation;
