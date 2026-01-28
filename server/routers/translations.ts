import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const LANGUAGES = ["es", "en", "fr", "de", "it", "pt", "ca", "eu", "gl"] as const;
const TRANSLATIONS_DIR = join(process.cwd(), "locales");

// Helper para leer archivo de traducción
function readTranslationFile(lang: string): Record<string, string> {
  try {
    const filePath = join(TRANSLATIONS_DIR, `${lang}.json`);
    const content = readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading translation file for ${lang}:`, error);
    return {};
  }
}

// Helper para escribir archivo de traducción
function writeTranslationFile(lang: string, data: Record<string, string>): void {
  try {
    const filePath = join(TRANSLATIONS_DIR, `${lang}.json`);
    // Ordenar las claves alfabéticamente antes de escribir
    const sortedData = Object.keys(data)
      .sort()
      .reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {} as Record<string, string>);
    
    writeFileSync(filePath, JSON.stringify(sortedData, null, 2), "utf-8");
  } catch (error) {
    console.error(`Error writing translation file for ${lang}:`, error);
    throw new Error(`Failed to write translation file for ${lang}`);
  }
}

export const translationsRouter = router({
  // Obtener lista de idiomas disponibles
  getLanguages: publicProcedure.query(() => {
    return LANGUAGES.map(lang => ({
      code: lang,
      name: {
        es: "Español",
        en: "English",
        fr: "Français",
        de: "Deutsch",
        it: "Italiano",
        pt: "Português",
        ca: "Català",
        eu: "Euskara",
        gl: "Galego",
      }[lang] || lang,
    }));
  }),

  // Obtener todas las claves de traducción
  getTranslationKeys: publicProcedure.query(() => {
    const esTranslations = readTranslationFile("es");
    return Object.keys(esTranslations).sort();
  }),

  // Obtener traducciones de un idioma específico
  getTranslations: publicProcedure
    .input(
      z.object({
        language: z.enum(LANGUAGES),
        search: z.string().optional(),
      })
    )
    .query(({ input }) => {
      const translations = readTranslationFile(input.language);
      let keys = Object.keys(translations);
      
      // Filtrar por búsqueda si se proporciona
      if (input.search) {
        const searchLower = input.search.toLowerCase();
        keys = keys.filter(key => 
          key.toLowerCase().includes(searchLower) ||
          translations[key]?.toLowerCase().includes(searchLower)
        );
      }
      
      // Ordenar las claves
      keys.sort();
      
      return keys.map(key => ({
        key,
        value: translations[key] || "",
      }));
    }),

  // Actualizar una traducción
  updateTranslation: protectedProcedure
    .input(
      z.object({
        language: z.enum(LANGUAGES),
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(({ input }) => {
      const translations = readTranslationFile(input.language);
      translations[input.key] = input.value;
      writeTranslationFile(input.language, translations);
      
      return {
        success: true,
        message: `Translation updated for ${input.language}: ${input.key}`,
      };
    }),

  // Actualizar múltiples traducciones a la vez
  updateMultipleTranslations: protectedProcedure
    .input(
      z.object({
        language: z.enum(LANGUAGES),
        translations: z.array(
          z.object({
            key: z.string(),
            value: z.string(),
          })
        ),
      })
    )
    .mutation(({ input }) => {
      const translations = readTranslationFile(input.language);
      
      for (const item of input.translations) {
        translations[item.key] = item.value;
      }
      
      writeTranslationFile(input.language, translations);
      
      return {
        success: true,
        message: `${input.translations.length} translations updated for ${input.language}`,
      };
    }),

  // Obtener estadísticas de traducciones
  getTranslationStats: publicProcedure.query(() => {
    const esTranslations = readTranslationFile("es");
    const totalKeys = Object.keys(esTranslations).length;
    
    const stats = LANGUAGES.map(lang => {
      const translations = readTranslationFile(lang);
      const keys = Object.keys(translations);
      const translatedKeys = keys.filter(key => {
        const value = translations[key];
        return value && value.trim() !== "";
      });
      
      return {
        language: lang,
        totalKeys,
        translatedKeys: translatedKeys.length,
        percentage: Math.round((translatedKeys.length / totalKeys) * 100),
      };
    });
    
    return stats;
  }),
});
