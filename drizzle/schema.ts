import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for quiz game (Math, Chemistry, Biology)
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayOrder: int("displayOrder").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Questions table with multiple choice options
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  difficulty: mysqlEnum("difficulty", ["Easy", "Medium", "Hard"]).notNull(),
  questionText: text("questionText").notNull(),
  optionA: text("optionA").notNull(),
  optionB: text("optionB").notNull(),
  optionC: text("optionC").notNull(),
  optionD: text("optionD").notNull(),
  correctAnswer: mysqlEnum("correctAnswer", ["A", "B", "C", "D"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Game sessions to track user progress through the quiz
 */
export const gameSessions = mysqlTable("gameSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  currentCategoryId: int("currentCategoryId").notNull(),
  currentDifficulty: mysqlEnum("currentDifficulty", ["Easy", "Medium", "Hard"]).notNull(),
  score: int("score").default(0).notNull(),
  questionsAnswered: int("questionsAnswered").default(0).notNull(),
  isCompleted: int("isCompleted").default(0).notNull(), // 0 = false, 1 = true
  completedCategories: text("completedCategories"), // JSON array of completed category IDs
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  durationSeconds: int("durationSeconds"),
});

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = typeof gameSessions.$inferInsert;

/**
 * Game statistics to track performance metrics
 */
export const gameStatistics = mysqlTable("gameStatistics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  categoryId: int("categoryId").notNull(),
  totalGames: int("totalGames").default(0).notNull(),
  totalCorrect: int("totalCorrect").default(0).notNull(),
  totalQuestions: int("totalQuestions").default(0).notNull(),
  fastestTimeSeconds: int("fastestTimeSeconds"),
  averageTimeSeconds: int("averageTimeSeconds"),
  lastPlayedAt: timestamp("lastPlayedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GameStatistic = typeof gameStatistics.$inferSelect;
export type InsertGameStatistic = typeof gameStatistics.$inferInsert;
