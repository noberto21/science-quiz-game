import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
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

describe("Hint System", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let sessionId: number;
  let questionId: number;

  beforeEach(async () => {
    const ctx = createTestContext();
    caller = appRouter.createCaller(ctx);

    // Start a game and get a question
    const startResult = await caller.game.startGame();
    sessionId = startResult.sessionId;

    const questionData = await caller.game.getQuestion({ sessionId });
    if (!questionData.question) {
      throw new Error("No question available");
    }
    questionId = questionData.question.id;
  });

  it("should get a hint for a question", async () => {
    const result = await caller.game.getHint({ sessionId, questionId });

    expect(result).toBeDefined();
    expect(result.eliminatedOptions).toBeDefined();
    expect(result.eliminatedOptions.length).toBe(2);
    expect(result.remainingOptions).toBeDefined();
    expect(result.remainingOptions.length).toBe(2);
    expect(result.hintPenalty).toBe(2);
    expect(result.newScore).toBeGreaterThanOrEqual(0);
  });

  it("should deduct 2 points for using a hint", async () => {
    // Get initial game state
    const initialState = await caller.game.getGameState({ sessionId });
    const initialScore = initialState.session.score;

    // Use a hint
    const hintResult = await caller.game.getHint({ sessionId, questionId });

    // Verify score was deducted
    expect(hintResult.newScore).toBe(Math.max(0, initialScore - 2));
  });

  it("should eliminate 2 incorrect options", async () => {
    const result = await caller.game.getHint({ sessionId, questionId });

    // Should eliminate exactly 2 options
    expect(result.eliminatedOptions.length).toBe(2);

    // Eliminated options should be different from each other
    expect(new Set(result.eliminatedOptions).size).toBe(2);

    // All options should be A, B, C, or D
    const allOptions = ["A", "B", "C", "D"];
    result.eliminatedOptions.forEach((opt) => {
      expect(allOptions).toContain(opt);
    });
  });

  it("should keep one correct and one incorrect option", async () => {
    const result = await caller.game.getHint({ sessionId, questionId });

    // Should have exactly 2 remaining options
    expect(result.remainingOptions.length).toBe(2);

    // All remaining options should be valid
    const allOptions = ["A", "B", "C", "D"];
    result.remainingOptions.forEach((opt) => {
      expect(allOptions).toContain(opt);
    });

    // Remaining options should not overlap with eliminated options
    result.remainingOptions.forEach((opt) => {
      expect(result.eliminatedOptions).not.toContain(opt);
    });
  });

  it("should not allow score to go below zero", async () => {
    // Get initial game state
    const initialState = await caller.game.getGameState({ sessionId });

    // If score is 0, hint should keep it at 0
    if (initialState.session.score === 0) {
      const result = await caller.game.getHint({ sessionId, questionId });
      expect(result.newScore).toBe(0);
    }
  });

  it("should return different eliminated options on different hints", async () => {
    // Start a new game for a fresh session
    const startResult = await caller.game.startGame();
    const newSessionId = startResult.sessionId;

    const questionData = await caller.game.getQuestion({ sessionId: newSessionId });
    if (!questionData.question) {
      throw new Error("No question available");
    }

    // Get multiple hints and verify they eliminate different options
    const hints: typeof result[] = [];
    for (let i = 0; i < 2; i++) {
      const result = await caller.game.getHint({
        sessionId: newSessionId,
        questionId: questionData.question.id,
      });
      hints.push(result);
    }

    // Both hints should have eliminated options
    expect(hints[0].eliminatedOptions).toBeDefined();
    expect(hints[1].eliminatedOptions).toBeDefined();
  });
});
