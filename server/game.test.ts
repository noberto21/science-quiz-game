import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb, createGameSession, getAllCategories } from "./db";

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

describe("Game Procedures", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let sessionId: number;

  beforeEach(async () => {
    const ctx = createTestContext();
    caller = appRouter.createCaller(ctx);
  });

  it("should get all categories", async () => {
    const categories = await caller.game.getCategories();
    
    expect(categories).toBeDefined();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories[0]).toHaveProperty("name");
    expect(categories[0]).toHaveProperty("displayOrder");
  });

  it("should start a new game session", async () => {
    const result = await caller.game.startGame();
    
    expect(result).toBeDefined();
    expect(result.sessionId).toBeTypeOf("number");
    expect(result.sessionId).toBeGreaterThan(0);
    
    sessionId = result.sessionId;
  });

  it("should get game state for a session", async () => {
    // Start a game first
    const startResult = await caller.game.startGame();
    sessionId = startResult.sessionId;

    const gameState = await caller.game.getGameState({ sessionId });
    
    expect(gameState).toBeDefined();
    expect(gameState.session).toBeDefined();
    expect(gameState.session.score).toBe(0);
    expect(gameState.session.currentDifficulty).toBe("Easy");
    expect(gameState.currentCategory).toBeDefined();
    expect(gameState.allCategories).toBeDefined();
  });

  it("should fetch a random question", async () => {
    // Start a game first
    const startResult = await caller.game.startGame();
    sessionId = startResult.sessionId;

    const questionData = await caller.game.getQuestion({ sessionId });
    
    expect(questionData).toBeDefined();
    expect(questionData.question).toBeDefined();
    expect(questionData.gameCompleted).toBe(false);
    
    if (questionData.question) {
      expect(questionData.question).toHaveProperty("questionText");
      expect(questionData.question).toHaveProperty("optionA");
      expect(questionData.question).toHaveProperty("optionB");
      expect(questionData.question).toHaveProperty("optionC");
      expect(questionData.question).toHaveProperty("optionD");
      // Should not expose correct answer
      expect(questionData.question).not.toHaveProperty("correctAnswer");
    }
  });

  it("should submit an answer and update score", async () => {
    // Start a game
    const startResult = await caller.game.startGame();
    sessionId = startResult.sessionId;

    // Get a question
    const questionData = await caller.game.getQuestion({ sessionId });
    expect(questionData.question).toBeDefined();
    
    if (!questionData.question) {
      throw new Error("No question available");
    }

    // Submit an answer (we'll submit A, regardless of correctness)
    const submitResult = await caller.game.submitAnswer({
      sessionId,
      questionId: questionData.question.id,
      answer: "A",
    });

    expect(submitResult).toBeDefined();
    expect(submitResult).toHaveProperty("isCorrect");
    expect(submitResult).toHaveProperty("correctAnswer");
    expect(submitResult).toHaveProperty("newScore");
    expect(submitResult).toHaveProperty("gameCompleted");
    expect(["A", "B", "C", "D"]).toContain(submitResult.correctAnswer);
  });

  it("should progress through difficulty levels", async () => {
    // Start a game
    const startResult = await caller.game.startGame();
    sessionId = startResult.sessionId;

    // Get initial state - should be Easy
    let gameState = await caller.game.getGameState({ sessionId });
    expect(gameState.session.currentDifficulty).toBe("Easy");

    // Submit an answer to progress
    const questionData = await caller.game.getQuestion({ sessionId });
    if (!questionData.question) {
      throw new Error("No question available");
    }

    await caller.game.submitAnswer({
      sessionId,
      questionId: questionData.question.id,
      answer: "A",
    });

    // Check state after submission - should progress to Medium
    gameState = await caller.game.getGameState({ sessionId });
    expect(gameState.session.currentDifficulty).toBe("Medium");
  });

  it("should handle database operations correctly", async () => {
    const db = await getDb();
    expect(db).toBeDefined();

    const categories = await getAllCategories();
    expect(categories).toBeDefined();
    expect(categories.length).toBeGreaterThanOrEqual(3);
    
    // Check that we have Math, Chemistry, and Biology
    const categoryNames = categories.map(c => c.name);
    expect(categoryNames).toContain("Math");
    expect(categoryNames).toContain("Chemistry");
    expect(categoryNames).toContain("Biology");
  });
});
