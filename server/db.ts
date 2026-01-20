import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, categories, questions, gameSessions, InsertGameSession, gameStatistics } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Quiz game database helpers

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(categories).orderBy(categories.displayOrder);
}

export async function getRandomQuestion(categoryId: number, difficulty: "Easy" | "Medium" | "Hard") {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(questions)
    .where(and(eq(questions.categoryId, categoryId), eq(questions.difficulty, difficulty)))
    .orderBy(sql`RAND()`)
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createGameSession(sessionData: InsertGameSession) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(gameSessions).values(sessionData).$returningId();
  return result[0]?.id ?? null;
}

export async function getGameSession(sessionId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(gameSessions).where(eq(gameSessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateGameSession(
  sessionId: number,
  updates: {
    currentCategoryId?: number;
    currentDifficulty?: "Easy" | "Medium" | "Hard";
    score?: number;
    questionsAnswered?: number;
    isCompleted?: number;
    completedCategories?: string;
    completedAt?: Date;
    durationSeconds?: number;
  }
) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(gameSessions).set(updates).where(eq(gameSessions.id, sessionId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update game session:", error);
    return false;
  }
}


// Statistics database helpers

export async function getOverallStatistics(userId: number | undefined) {
  const db = await getDb();
  if (!db || !userId) return null;

  const stats = await db
    .select({
      totalGames: sql`COUNT(DISTINCT id)`,
      totalCorrect: sql`SUM(score)`,
      totalQuestions: sql`SUM(questionsAnswered)`,
      fastestTime: sql`MIN(durationSeconds)`,
      averageTime: sql`AVG(durationSeconds)`,
    })
    .from(gameSessions)
    .where(and(eq(gameSessions.userId, userId), eq(gameSessions.isCompleted, 1)));

  return stats[0] || null;
}

export async function getCategoryStatistics(userId: number | undefined) {
  const db = await getDb();
  if (!db || !userId) return [];

  return await db
    .select({
      categoryId: gameSessions.currentCategoryId,
      categoryName: categories.name,
      totalGames: sql`COUNT(DISTINCT ${gameSessions.id})`,
      totalCorrect: sql`SUM(${gameSessions.score})`,
      totalQuestions: sql`SUM(${gameSessions.questionsAnswered})`,
      fastestTime: sql`MIN(${gameSessions.durationSeconds})`,
      averageTime: sql`AVG(${gameSessions.durationSeconds})`,
      lastPlayed: sql`MAX(${gameSessions.completedAt})`,
    })
    .from(gameSessions)
    .innerJoin(categories, eq(gameSessions.currentCategoryId, categories.id))
    .where(and(eq(gameSessions.userId, userId), eq(gameSessions.isCompleted, 1)))
    .groupBy(gameSessions.currentCategoryId);
}

export async function getRecentGames(userId: number | undefined, limit: number = 10) {
  const db = await getDb();
  if (!db || !userId) return [];

  return await db
    .select({
      id: gameSessions.id,
      score: gameSessions.score,
      questionsAnswered: gameSessions.questionsAnswered,
      categoryName: categories.name,
      durationSeconds: gameSessions.durationSeconds,
      completedAt: gameSessions.completedAt,
    })
    .from(gameSessions)
    .innerJoin(categories, eq(gameSessions.currentCategoryId, categories.id))
    .where(and(eq(gameSessions.userId, userId), eq(gameSessions.isCompleted, 1)))
    .orderBy(desc(gameSessions.completedAt))
    .limit(limit);
}
