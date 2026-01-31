import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GeometricBackground } from "@/components/GeometricBackground";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, Lightbulb } from "lucide-react";
import { playCorrectSound, playIncorrectSound, playCelebrationSound } from "@/lib/audio";

export default function QuizScreen() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [hintMessage, setHintMessage] = useState("");
  const [currentCombo, setCurrentCombo] = useState(0);
  const [comboBonus, setComboBonus] = useState(0);

  // Start game mutation
  const startGameMutation = trpc.game.startGame.useMutation();

  // Get game state
  const { data: gameState, refetch: refetchGameState } = trpc.game.getGameState.useQuery(
    { sessionId: sessionId! },
    { enabled: sessionId !== null }
  );

  // Get question
  const { data: questionData, refetch: refetchQuestion, isLoading: isLoadingQuestion } = trpc.game.getQuestion.useQuery(
    { sessionId: sessionId! },
    { enabled: sessionId !== null }
  );

  // Submit answer mutation
  const submitAnswerMutation = trpc.game.submitAnswer.useMutation();

  // Get hint mutation
  const getHintMutation = trpc.game.getHint.useMutation();

  // Initialize game on mount
  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("sessionId");
    if (storedSessionId) {
      // Use existing session from subject selection
      setSessionId(parseInt(storedSessionId));
    } else {
      // Fallback: start a new game without category selection
      const initGame = async () => {
        try {
          const result = await startGameMutation.mutateAsync();
          setSessionId(result.sessionId);
        } catch (error) {
          console.error("Failed to start game:", error);
        }
      };
      initGame();
    }
  }, []);

  // Check if game is completed
  useEffect(() => {
    if (questionData?.gameCompleted) {
      setLocation("/end");
    }
  }, [questionData, setLocation]);

  const handleSubmitAnswer = async (answer: "A" | "B" | "C" | "D") => {
    if (showResult || !questionData?.question?.id) return;

    setSelectedAnswer(answer);

    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId: sessionId!,
        questionId: questionData.question.id,
        answer: answer,
      });

      setIsCorrect(result.isCorrect);
      setCorrectAnswer(result.correctAnswer);
      setShowResult(true);

      // Play sound
      if (result.isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Auto-advance after 2 seconds
      setTimeout(() => {
        if (result.gameCompleted) {
          sessionStorage.setItem("finalScore", result.newScore.toString());
          setLocation("/end");
        } else {
          setShowResult(false);
          setSelectedAnswer(null);
          setHintUsed(false);
          setEliminatedOptions([]);
          setHintMessage("");
          refetchGameState();
          refetchQuestion();
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleUseHint = async () => {
    if (hintUsed || !questionData?.question?.id) return;

    try {
      const result = await getHintMutation.mutateAsync({
        sessionId: sessionId!,
        questionId: questionData.question.id,
      });

      setEliminatedOptions(result.eliminatedOptions);
      setHintUsed(true);
      setHintMessage(`Hint: ${result.eliminatedOptions.length} incorrect options eliminated!`);
    } catch (error) {
      console.error("Failed to get hint:", error);
    }
  };

  if (!sessionId || isLoadingQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <GeometricBackground />
        <div className="relative z-10 text-center">
          <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
          <p className="text-xl font-black uppercase">Loading Question...</p>
        </div>
      </div>
    );
  }

  if (!questionData) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <GeometricBackground />
        <div className="relative z-10 text-center">
          <p className="text-xl font-black uppercase">Error loading question</p>
        </div>
      </div>
    );
  }

  const maxScore = 9 * 5; // 9 questions × 5 points
  const scorePercentage = (gameState?.session?.score || 0) / maxScore;

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <GeometricBackground />

      <div className="container relative z-10 max-w-4xl">
        {/* Header with Score and Difficulty */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="text-center">
            <p className="text-sm font-bold uppercase text-foreground/70 mb-1">Category</p>
            <p className="text-2xl font-black uppercase text-foreground">{gameState?.currentCategory?.name}</p>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold uppercase text-foreground/70 mb-1">Difficulty</p>
            <p className="text-2xl font-black uppercase text-foreground">{gameState?.session?.currentDifficulty}</p>
          </div>

          <div className="text-center">
            <p className="text-sm font-bold uppercase text-foreground/70 mb-1">Score</p>
            <p className="text-2xl font-black uppercase text-foreground">{gameState?.session?.score || 0}</p>
          </div>

          {currentCombo > 1 && (
            <div className="text-center bg-accent/20 px-4 py-2 rounded-lg border-2 border-accent">
              <p className="text-sm font-bold uppercase text-accent mb-1">Combo</p>
              <p className="text-2xl font-black uppercase text-accent">{currentCombo}x</p>
            </div>
          )}
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8 border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] bg-card">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide mb-8 text-foreground">
            {questionData.question?.questionText || "Loading..."}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {questionData.question && ["A", "B", "C", "D"].map((option) => {
              const optionKey = `option${option}` as keyof typeof questionData.question;
              return (
                <Button
                  key={option}
                  onClick={() => handleSubmitAnswer(option as "A" | "B" | "C" | "D")}
                  disabled={showResult || eliminatedOptions.includes(option)}
                  className={`p-6 h-auto text-lg font-black uppercase border-4 transition-all ${
                    selectedAnswer === option
                      ? isCorrect
                        ? "bg-green-400 border-green-600 animate-pulse-glow"
                        : "bg-red-400 border-red-600 animate-shake"
                      : eliminatedOptions.includes(option)
                      ? "opacity-30 cursor-not-allowed"
                      : "bg-primary hover:bg-primary/90 border-foreground/20 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                  }`}
                >
                  <span className="mr-4 font-black">{option}.</span>
                  {(questionData.question as any)[optionKey]}
                </Button>
              );
            })}
          </div>

          {/* Hint Button */}
          <div className="flex gap-4 justify-center mb-6">
            <Button
              onClick={handleUseHint}
              disabled={hintUsed || showResult}
              variant="outline"
              className="px-6 py-4 font-black uppercase border-2"
            >
              <Lightbulb className="w-5 h-5 mr-2" />
              Use Hint (-2 pts)
            </Button>
          </div>

          {/* Hint Message */}
          {hintMessage && (
            <p className="text-center text-sm font-bold uppercase text-accent mb-4">{hintMessage}</p>
          )}

          {/* Result Feedback */}
          {showResult && (
            <div className={`p-6 rounded-lg border-4 text-center ${
              isCorrect
                ? "bg-green-100 border-green-400"
                : "bg-red-100 border-red-400"
            }`}>
              <p className={`text-2xl font-black uppercase mb-2 ${
                isCorrect ? "text-green-700" : "text-red-700"
              }`}>
                {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
              </p>
              <p className="text-lg font-bold uppercase text-foreground/80">
                {isCorrect ? `+5 points` : `Correct answer: ${correctAnswer}`}
              </p>

            </div>
          )}
        </Card>

        {/* Progress Bar */}
        <div className="w-full bg-foreground/10 rounded-full h-4 border-2 border-foreground/20 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${scorePercentage * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
