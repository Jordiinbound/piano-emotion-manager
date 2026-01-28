import { mysqlTable, int, varchar, timestamp, tinyint, index } from "drizzle-orm/mysql-core";
import { users } from "./schema";

export const onboardingProgress = mysqlTable("onboarding_progress", {
  id: int().autoincrement().notNull(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  step: varchar({ length: 50 }).notNull(),
  completed: tinyint().default(0).notNull(),
  completedAt: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().onUpdateNow().notNull(),
},
(table) => [
  index("idx_user_step").on(table.userId, table.step),
]);

export type OnboardingProgress = typeof onboardingProgress.$inferSelect;
export type InsertOnboardingProgress = typeof onboardingProgress.$inferInsert;
