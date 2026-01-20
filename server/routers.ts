import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllCategories,
  getRandomQuestion,
  createGameSession,
  getGameSession,
  updateGameSession,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  game: router({
    // Get all categories
    getCategories: publicProcedure.query(async () => {
      return await getAllCategories();
    }),

    // Start a new game session
    startGame: publicProcedure.mutation(async ({ ctx }) => {
      const allCategories = await getAllCategories();
      if (allCategories.length === 0) {
        throw new Error("No categories available");
      }

      const firstCategory = allCategories[0];
      const sessionId = await createGameSession({
        userId: ctx.user?.id,
        currentCategoryId: firstCategory.id,
        currentDifficulty: "Easy",
        score: 0,
        questionsAnswered: 0,
        isCompleted: 0,
        completedCategories: JSON.stringify([]),
      });

      if (!sessionId) {
        throw new Error("Failed to create game session");
      }

      return { sessionId };
    }),

    // Get current game state
    getGameState: publicProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const session = await getGameSession(input.sessionId);
        if (!session) {
          throw new Error("Game session not found");
        }

        const allCategories = await getAllCategories();
        const currentCategory = allCategories.find((c) => c.id === session.currentCategoryId);

        return {
          session,
          currentCategory,
          allCategories,
        };
      }),

    // Get a random question
    getQuestion: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
        })
      )
      .query(async ({ input }) => {
        const session = await getGameSession(input.sessionId);
        if (!session) {
          throw new Error("Game session not found");
        }

        if (session.isCompleted === 1) {
          return { question: null, gameCompleted: true };
        }

        const question = await getRandomQuestion(session.currentCategoryId, session.currentDifficulty);
        
        if (!question) {
          return { question: null, gameCompleted: false, error: "No questions available" };
        }

        // Return question without the correct answer
        const { correctAnswer, ...questionData } = question;
        return { question: questionData, gameCompleted: false };
      }),

    // Get a hint for the current question
    getHint: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          questionId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const session = await getGameSession(input.sessionId);
        if (!session) {
          throw new Error("Game session not found");
        }

        // Get the question
        const db = await import("./db").then((m) => m.getDb());
        if (!db) {
          throw new Error("Database not available");
        }

        const { questions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const questionResult = await db.select().from(questions).where(eq(questions.id, input.questionId)).limit(1);
        
        if (questionResult.length === 0) {
          throw new Error("Question not found");
        }

        const question = questionResult[0];
        const correctAnswer = question.correctAnswer;
        const hintPenalty = 1; // Deduct 1 point for using a hint
        const newScore = Math.max(0, session.score - hintPenalty);

        // Generate hint: eliminate 2 incorrect options, keep correct + 1 other
        const allOptions = [
          { letter: "A", text: question.optionA },
          { letter: "B", text: question.optionB },
          { letter: "C", text: question.optionC },
          { letter: "D", text: question.optionD },
        ];

        // Find the correct option
        const correctOption = allOptions.find((opt) => opt.letter === correctAnswer);
        const incorrectOptions = allOptions.filter((opt) => opt.letter !== correctAnswer);

        // Randomly select 1 incorrect option to keep
        const randomIncorrectIndex = Math.floor(Math.random() * incorrectOptions.length);
        const keptIncorrectOption = incorrectOptions[randomIncorrectIndex];

        // Eliminated options are the other incorrect ones
        const eliminatedOptions = incorrectOptions
          .filter((_, index) => index !== randomIncorrectIndex)
          .map((opt) => opt.letter);

        // Update session score
        await updateGameSession(input.sessionId, {
          score: newScore,
        });

        return {
          eliminatedOptions,
          remainingOptions: [correctOption?.letter, keptIncorrectOption.letter],
          hintPenalty,
          newScore,
        };
      }),

    // Submit an answer
    submitAnswer: publicProcedure
      .input(
        z.object({
          sessionId: z.number(),
          questionId: z.number(),
          answer: z.enum(["A", "B", "C", "D"]),
        })
      )
      .mutation(async ({ input }) => {
        const session = await getGameSession(input.sessionId);
        if (!session) {
          throw new Error("Game session not found");
        }

        // Get the question to check the answer
        const db = await import("./db").then((m) => m.getDb());
        if (!db) {
          throw new Error("Database not available");
        }

        const { questions } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const questionResult = await db.select().from(questions).where(eq(questions.id, input.questionId)).limit(1);
        
        if (questionResult.length === 0) {
          throw new Error("Question not found");
        }

        const question = questionResult[0];
        const isCorrect = question.correctAnswer === input.answer;
        const newScore = isCorrect ? session.score + 1 : session.score;
        const newQuestionsAnswered = session.questionsAnswered + 1;

        // Determine next difficulty/category
        const allCategories = await getAllCategories();
        const completedCategoriesArray = JSON.parse(session.completedCategories || "[]");
        
        let nextDifficulty = session.currentDifficulty;
        let nextCategoryId = session.currentCategoryId;
        let isGameCompleted = false;

        // Progress through difficulties: Easy -> Medium -> Hard
        if (session.currentDifficulty === "Easy") {
          nextDifficulty = "Medium";
        } else if (session.currentDifficulty === "Medium") {
          nextDifficulty = "Hard";
        } else if (session.currentDifficulty === "Hard") {
          // Completed all difficulties for this category
          completedCategoriesArray.push(session.currentCategoryId);
          
          // Find next category
          const nextCategory = allCategories.find(
            (c) => !completedCategoriesArray.includes(c.id)
          );

          if (nextCategory) {
            nextCategoryId = nextCategory.id;
            nextDifficulty = "Easy";
          } else {
            // All categories completed
            isGameCompleted = true;
          }
        }

        // Update session
        await updateGameSession(input.sessionId, {
          score: newScore,
          questionsAnswered: newQuestionsAnswered,
          currentCategoryId: nextCategoryId,
          currentDifficulty: nextDifficulty,
          isCompleted: isGameCompleted ? 1 : 0,
          completedCategories: JSON.stringify(completedCategoriesArray),
          completedAt: isGameCompleted ? new Date() : undefined,
        });

        return {
          isCorrect,
          correctAnswer: question.correctAnswer,
          newScore,
          gameCompleted: isGameCompleted,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
