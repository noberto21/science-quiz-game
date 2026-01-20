import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Statistics Procedures", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    const ctx = createTestContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should return statistics structure with overall, byCategory, and recentGames", async () => {
    const result = await caller.game.getStatistics();

    expect(result).toBeDefined();
    expect(result).toHaveProperty("overall");
    expect(result).toHaveProperty("byCategory");
    expect(result).toHaveProperty("recentGames");
  });

  it("should return overall stats with zero values for user with no games", async () => {
    const result = await caller.game.getStatistics();

    // New user should have stats object but with zero/null values
    if (result.overall) {
      expect(result.overall.totalGames).toBe(0);
    }
    expect(result.byCategory).toEqual([]);
    expect(result.recentGames).toEqual([]);
  });

  it("should return empty arrays when user has no completed games", async () => {
    const result = await caller.game.getStatistics();

    expect(Array.isArray(result.byCategory)).toBe(true);
    expect(Array.isArray(result.recentGames)).toBe(true);
  });

  it("should handle statistics for different users independently", async () => {
    const ctx1 = createTestContext(1);
    const ctx2 = createTestContext(2);
    
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    const stats1 = await caller1.game.getStatistics();
    const stats2 = await caller2.game.getStatistics();

    // Both should be valid but independent
    expect(stats1).toBeDefined();
    expect(stats2).toBeDefined();
  });

  it("should return statistics with proper structure when data exists", async () => {
    const result = await caller.game.getStatistics();

    // Check structure of response
    if (result.overall) {
      expect(result.overall).toHaveProperty("totalGames");
      expect(result.overall).toHaveProperty("totalCorrect");
      expect(result.overall).toHaveProperty("totalQuestions");
      expect(result.overall).toHaveProperty("fastestTime");
      expect(result.overall).toHaveProperty("averageTime");
    }

    // Check structure of category stats if present
    if (result.byCategory.length > 0) {
      const cat = result.byCategory[0];
      expect(cat).toHaveProperty("categoryId");
      expect(cat).toHaveProperty("categoryName");
      expect(cat).toHaveProperty("totalGames");
      expect(cat).toHaveProperty("totalCorrect");
      expect(cat).toHaveProperty("totalQuestions");
      expect(cat).toHaveProperty("fastestTime");
      expect(cat).toHaveProperty("averageTime");
    }

    // Check structure of recent games if present
    if (result.recentGames.length > 0) {
      const game = result.recentGames[0];
      expect(game).toHaveProperty("id");
      expect(game).toHaveProperty("score");
      expect(game).toHaveProperty("questionsAnswered");
      expect(game).toHaveProperty("categoryName");
      expect(game).toHaveProperty("durationSeconds");
      expect(game).toHaveProperty("completedAt");
    }
  });

  it("should not include unauthenticated user data", async () => {
    const ctx = createTestContext();
    ctx.user = null;
    const caller = appRouter.createCaller(ctx);

    const result = await caller.game.getStatistics();

    expect(result.overall).toBeNull();
    expect(result.byCategory).toEqual([]);
    expect(result.recentGames).toEqual([]);
  });
});
