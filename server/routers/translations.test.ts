import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import type { Context } from "../_core/context";

// Mock context for testing
const createMockContext = (): Context => ({
  user: {
    id: 1,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  req: {} as any,
  res: {} as any,
});

describe("Translations Router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller(createMockContext());
  });

  describe("getLanguages", () => {
    it("should return list of supported languages", async () => {
      const languages = await caller.translations.getLanguages();
      
      expect(languages).toBeDefined();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBe(9); // 9 idiomas soportados
      
      // Verificar que incluye español
      const spanish = languages.find(l => l.code === "es");
      expect(spanish).toBeDefined();
      expect(spanish?.name).toBe("Español");
      
      // Verificar que incluye inglés
      const english = languages.find(l => l.code === "en");
      expect(english).toBeDefined();
      expect(english?.name).toBe("English");
    });
  });

  describe("getTranslationKeys", () => {
    it("should return sorted list of translation keys", async () => {
      const keys = await caller.translations.getTranslationKeys();
      
      expect(keys).toBeDefined();
      expect(Array.isArray(keys)).toBe(true);
      expect(keys.length).toBeGreaterThan(0);
      
      // Verificar que las claves están ordenadas
      const sortedKeys = [...keys].sort();
      expect(keys).toEqual(sortedKeys);
      
      // Verificar que incluye algunas claves conocidas
      expect(keys.some(k => k.includes("common"))).toBe(true);
    });
  });

  describe("getTranslations", () => {
    it("should return translations for Spanish", async () => {
      const result = await caller.translations.getTranslations({
        language: "es",
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Verificar estructura de las traducciones
      const firstTranslation = result[0];
      expect(firstTranslation).toHaveProperty("key");
      expect(firstTranslation).toHaveProperty("value");
      expect(typeof firstTranslation.key).toBe("string");
      expect(typeof firstTranslation.value).toBe("string");
    });

    it("should filter translations by search term", async () => {
      const result = await caller.translations.getTranslations({
        language: "es",
        search: "common",
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      // Todas las traducciones deben contener "common" en la clave o valor
      result.forEach(t => {
        const matchesKey = t.key.toLowerCase().includes("common");
        const matchesValue = t.value.toLowerCase().includes("common");
        expect(matchesKey || matchesValue).toBe(true);
      });
    });
  });

  describe("updateTranslation", () => {
    it("should update a translation successfully", async () => {
      const testKey = "common.test";
      const testValue = "Valor de prueba actualizado";
      
      const result = await caller.translations.updateTranslation({
        language: "es",
        key: testKey,
        value: testValue,
      });
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain("Translation updated");
    });
  });
});
