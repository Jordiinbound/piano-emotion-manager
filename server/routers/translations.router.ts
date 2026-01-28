/**
 * Translations Router - Piano Emotion Manager
 * Gestión de traducciones del sistema i18n
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as fs from 'fs/promises';
import * as path from 'path';

const LOCALES_PATH = path.join(process.cwd(), 'locales');

const supportedLanguages = ['es', 'en', 'fr', 'de', 'it', 'pt', 'da', 'no', 'sv'];

export const translationsRouter = router({
  /**
   * Obtener todas las traducciones de un idioma
   */
  getTranslations: adminProcedure
    .input(z.object({
      language: z.enum(['es', 'en', 'fr', 'de', 'it', 'pt', 'da', 'no', 'sv']),
    }))
    .query(async ({ input }) => {
      try {
        const filePath = path.join(LOCALES_PATH, input.language, 'translations.json');
        const content = await fs.readFile(filePath, 'utf-8');
        const translations = JSON.parse(content);
        
        return {
          language: input.language,
          translations,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Error loading translations for ${input.language}`,
        });
      }
    }),

  /**
   * Obtener lista de todos los idiomas con estadísticas
   */
  getAllLanguages: adminProcedure
    .query(async () => {
      const languages = [];
      
      for (const lang of supportedLanguages) {
        try {
          const filePath = path.join(LOCALES_PATH, lang, 'translations.json');
          const content = await fs.readFile(filePath, 'utf-8');
          const translations = JSON.parse(content);
          
          // Contar claves de traducción
          const countKeys = (obj: any): number => {
            let count = 0;
            for (const key in obj) {
              if (typeof obj[key] === 'object' && obj[key] !== null) {
                count += countKeys(obj[key]);
              } else {
                count++;
              }
            }
            return count;
          };
          
          languages.push({
            code: lang,
            keyCount: countKeys(translations),
            lastModified: (await fs.stat(filePath)).mtime,
          });
        } catch (error) {
          console.error(`Error loading ${lang}:`, error);
        }
      }
      
      return languages;
    }),

  /**
   * Actualizar una traducción específica
   */
  updateTranslation: adminProcedure
    .input(z.object({
      language: z.enum(['es', 'en', 'fr', 'de', 'it', 'pt', 'da', 'no', 'sv']),
      key: z.string(),
      value: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const filePath = path.join(LOCALES_PATH, input.language, 'translations.json');
        const content = await fs.readFile(filePath, 'utf-8');
        const translations = JSON.parse(content);
        
        // Navegar por el path de la clave (ej: "alerts.title")
        const keys = input.key.split('.');
        let current = translations;
        
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current = current[keys[i]];
        }
        
        // Actualizar valor
        current[keys[keys.length - 1]] = input.value;
        
        // Guardar archivo
        await fs.writeFile(filePath, JSON.stringify(translations, null, 2), 'utf-8');
        
        return {
          success: true,
          message: 'Translation updated successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating translation',
        });
      }
    }),

  /**
   * Actualizar múltiples traducciones a la vez
   */
  updateBulkTranslations: adminProcedure
    .input(z.object({
      language: z.enum(['es', 'en', 'fr', 'de', 'it', 'pt', 'da', 'no', 'sv']),
      translations: z.record(z.string()),
    }))
    .mutation(async ({ input }) => {
      try {
        const filePath = path.join(LOCALES_PATH, input.language, 'translations.json');
        const content = await fs.readFile(filePath, 'utf-8');
        const translations = JSON.parse(content);
        
        // Actualizar cada traducción
        for (const [key, value] of Object.entries(input.translations)) {
          const keys = key.split('.');
          let current = translations;
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current = current[keys[i]];
          }
          
          current[keys[keys.length - 1]] = value;
        }
        
        // Guardar archivo
        await fs.writeFile(filePath, JSON.stringify(translations, null, 2), 'utf-8');
        
        return {
          success: true,
          count: Object.keys(input.translations).length,
          message: `${Object.keys(input.translations).length} translations updated successfully`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error updating translations',
        });
      }
    }),

  /**
   * Buscar claves de traducción
   */
  searchTranslations: adminProcedure
    .input(z.object({
      language: z.enum(['es', 'en', 'fr', 'de', 'it', 'pt', 'da', 'no', 'sv']),
      query: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        const filePath = path.join(LOCALES_PATH, input.language, 'translations.json');
        const content = await fs.readFile(filePath, 'utf-8');
        const translations = JSON.parse(content);
        
        const results: Array<{ key: string; value: string }> = [];
        
        const search = (obj: any, prefix: string = '') => {
          for (const key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              search(obj[key], fullKey);
            } else {
              const value = String(obj[key]);
              if (
                fullKey.toLowerCase().includes(input.query.toLowerCase()) ||
                value.toLowerCase().includes(input.query.toLowerCase())
              ) {
                results.push({ key: fullKey, value });
              }
            }
          }
        };
        
        search(translations);
        
        return results;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error searching translations',
        });
      }
    }),

  /**
   * Exportar traducciones de un idioma
   */
  exportTranslations: adminProcedure
    .input(z.object({
      language: z.enum(['es', 'en', 'fr', 'de', 'it', 'pt', 'da', 'no', 'sv']),
    }))
    .query(async ({ input }) => {
      try {
        const filePath = path.join(LOCALES_PATH, input.language, 'translations.json');
        const content = await fs.readFile(filePath, 'utf-8');
        
        return {
          language: input.language,
          content,
          filename: `translations-${input.language}.json`,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Error exporting translations',
        });
      }
    }),

  /**
   * Importar traducciones desde JSON
   */
  importTranslations: adminProcedure
    .input(z.object({
      language: z.enum(['es', 'en', 'fr', 'de', 'it', 'pt', 'da', 'no', 'sv']),
      content: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Validar JSON
        const translations = JSON.parse(input.content);
        
        const filePath = path.join(LOCALES_PATH, input.language, 'translations.json');
        await fs.writeFile(filePath, JSON.stringify(translations, null, 2), 'utf-8');
        
        return {
          success: true,
          message: 'Translations imported successfully',
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid JSON format',
        });
      }
    }),
});
