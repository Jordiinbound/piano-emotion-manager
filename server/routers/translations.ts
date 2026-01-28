import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const LANGUAGES = ["es", "en", "fr", "de", "it", "pt", "nl", "ca", "eu", "gl"] as const;
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
        nl: "Nederlands",
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

  // Exportar traducciones a CSV
  exportToCSV: protectedProcedure
    .input(
      z.object({
        languages: z.array(z.enum(LANGUAGES)).optional(),
      })
    )
    .query(({ input }) => {
      const languagesToExport = input.languages || LANGUAGES;
      
      // Obtener todas las claves del idioma base (español)
      const baseTranslations = readTranslationFile("es");
      const keys = Object.keys(baseTranslations).sort();
      
      // Crear CSV header
      const header = ["key", ...languagesToExport].join(",");
      
      // Crear filas CSV
      const rows = keys.map(key => {
        const values = languagesToExport.map(lang => {
          const translations = readTranslationFile(lang);
          const value = translations[key] || "";
          // Escapar comillas y comas en el valor
          return `"${value.replace(/"/g, '""')}"`;
        });
        return `"${key}",${values.join(",")}`;
      });
      
      const csvContent = [header, ...rows].join("\n");
      
      return {
        content: csvContent,
        filename: `translations_${new Date().toISOString().split('T')[0]}.csv`,
      };
    }),

  // Importar traducciones desde CSV
  importFromCSV: protectedProcedure
    .input(
      z.object({
        csvContent: z.string(),
        overwrite: z.boolean().default(false),
      })
    )
    .mutation(({ input }) => {
      try {
        // Parsear CSV
        const lines = input.csvContent.split("\n").filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error("CSV file is empty or invalid");
        }
        
        // Parsear header
        const header = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        const keyIndex = header.indexOf("key");
        if (keyIndex === -1) {
          throw new Error("CSV must have a 'key' column");
        }
        
        // Obtener idiomas del header (todos excepto 'key')
        const languages = header.filter((h, i) => i !== keyIndex);
        
        // Validar que los idiomas son soportados
        const invalidLanguages = languages.filter(lang => !LANGUAGES.includes(lang as any));
        if (invalidLanguages.length > 0) {
          throw new Error(`Unsupported languages: ${invalidLanguages.join(", ")}`);
        }
        
        // Cargar traducciones existentes
        const translationsData: Record<string, Record<string, string>> = {};
        languages.forEach(lang => {
          translationsData[lang] = input.overwrite ? {} : readTranslationFile(lang);
        });
        
        // Parsear filas
        let updatedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Parsear CSV con soporte para comillas
          const values: string[] = [];
          let currentValue = "";
          let insideQuotes = false;
          
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              if (insideQuotes && line[j + 1] === '"') {
                currentValue += '"';
                j++; // Skip next quote
              } else {
                insideQuotes = !insideQuotes;
              }
            } else if (char === ',' && !insideQuotes) {
              values.push(currentValue);
              currentValue = "";
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue); // Add last value
          
          if (values.length !== header.length) {
            console.warn(`Skipping invalid line ${i + 1}: column count mismatch`);
            continue;
          }
          
          const key = values[keyIndex].trim();
          if (!key) continue;
          
          // Actualizar traducciones
          languages.forEach((lang, langIndex) => {
            const valueIndex = langIndex < keyIndex ? langIndex : langIndex + 1;
            const value = values[valueIndex]?.trim() || "";
            if (value) {
              translationsData[lang][key] = value;
              updatedCount++;
            }
          });
        }
        
        // Guardar traducciones actualizadas
        languages.forEach(lang => {
          writeTranslationFile(lang, translationsData[lang]);
        });
        
        return {
          success: true,
          message: `Successfully imported ${updatedCount} translations for ${languages.length} languages`,
          updatedCount,
          languages,
        };
      } catch (error: any) {
        throw new Error(`Failed to import translations: ${error.message}`);
      }
    }),
});
