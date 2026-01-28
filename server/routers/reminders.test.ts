/**
 * Tests para el router de recordatorios
 * Piano Emotion Manager - Manus
 */
import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import type { Context } from "./_core/context";

// Mock context
const mockContext: Context = {
  user: {
    id: "test-user-1",
    email: "test@example.com",
    name: "Test User",
  },
  req: {} as any,
  res: {} as any,
};

describe("Reminders Router", () => {
  const caller = appRouter.createCaller(mockContext);

  describe("getStats", () => {
    it("should return reminder statistics", async () => {
      const result = await caller.reminders.getStats();

      expect(result).toBeDefined();
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("completed");
      expect(result).toHaveProperty("pending");
      expect(result).toHaveProperty("overdue");
      expect(result).toHaveProperty("dueToday");
      expect(result).toHaveProperty("dueThisWeek");
      expect(result).toHaveProperty("byType");
      expect(typeof result.total).toBe("number");
      expect(typeof result.completed).toBe("number");
      expect(typeof result.pending).toBe("number");
      expect(typeof result.overdue).toBe("number");
    });
  });

  describe("list", () => {
    it("should return paginated list of reminders", async () => {
      const result = await caller.reminders.list({
        limit: 10,
        sortBy: "dueDate",
        sortOrder: "asc",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("items");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("stats");
      expect(Array.isArray(result.items)).toBe(true);
      expect(typeof result.total).toBe("number");
    });

    it("should filter reminders by completion status", async () => {
      const result = await caller.reminders.list({
        isCompleted: false,
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // All items should be incomplete
      result.items.forEach((item: any) => {
        expect(item.isCompleted).toBe(0);
      });
    });

    it("should filter reminders by type", async () => {
      const result = await caller.reminders.list({
        reminderType: "call",
        limit: 10,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      // All items should be of type 'call'
      result.items.forEach((item: any) => {
        expect(item.reminderType).toBe("call");
      });
    });
  });

  describe("getPending", () => {
    it("should return only pending reminders", async () => {
      const result = await caller.reminders.getPending();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // All items should be incomplete
      result.forEach((item: any) => {
        expect(item.isCompleted).toBe(0);
      });
    });
  });

  describe("getOverdue", () => {
    it("should return only overdue reminders", async () => {
      const result = await caller.reminders.getOverdue();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // All items should be incomplete
      result.forEach((item: any) => {
        expect(item.isCompleted).toBe(0);
      });
    });
  });

  describe("getUpcoming", () => {
    it("should return upcoming reminders for next 7 days", async () => {
      const result = await caller.reminders.getUpcoming({
        daysAhead: 7,
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // All items should be incomplete
      result.forEach((item: any) => {
        expect(item.isCompleted).toBe(0);
      });
    });
  });

  describe("listAll", () => {
    it("should return all reminders without pagination", async () => {
      const result = await caller.reminders.listAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      // Should have isOverdue property added
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("isOverdue");
      }
    });
  });
});
