import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GeometricBackground } from "@/components/GeometricBackground";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

export default function QuizScreen() {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<"A" | "B" | "C" | "D" | null>(null);

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

  // Initialize game on mount
  useEffect(() => {
    const initGame = async () => {
      try {
        const result = await startGameMutation.mutateAsync();
        setSessionId(result.sessionId);
      } catch (error) {
        console.error("Failed to start game:", error);
      }
    };
    initGame();
  }, []);

  // Check if game is completed
  useEffect(() => {
    if (questionData?.gameCompleted) {
      setLocation("/end");
    }
  }, [questionData, setLocation]);

  const handleAnswerSelect = (answer: "A" | "B" | "C" | "D") => {
    if (!showResult) {
      setSelectedAnswer(answer);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !questionData?.question || !sessionId) return;

    try {
      const result = await submitAnswerMutation.mutateAsync({
        sessionId,
        questionId: questionData.question.id,
        answer: selectedAnswer,
      });

      setIsCorrect(result.isCorrect);
      setCorrectAnswer(result.correctAnswer);
      setShowResult(true);

      // Wait 2 seconds then move to next question
      setTimeout(() => {
        if (result.gameCompleted) {
          sessionStorage.setItem("finalScore", result.newScore.toString());
          setLocation("/end");
        } else {
          setShowResult(false);
          setSelectedAnswer(null);
          setCorrectAnswer(null);
          refetchQuestion();
          refetchGameState();
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  if (!sessionId || !gameState || !questionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  const question = questionData.question;

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl font-bold">Loading question...</p>
      </div>
    );
  }

  const options = [
    { letter: "A" as const, text: question.optionA },
    { letter: "B" as const, text: question.optionB },
    { letter: "C" as const, text: question.optionC },
    { letter: "D" as const, text: question.optionD },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <GeometricBackground />

      <div className="container relative z-10 max-w-4xl">
        {/* Header with score and difficulty */}
        <div className="flex justify-between items-center mb-8">
          <Card className="px-6 py-3 bg-card border-4 border-foreground/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
            <p className="text-xl font-black uppercase tracking-wide">
              Score: <span className="text-primary">{gameState.session.score}</span>
            </p>
          </Card>

          <Card className="px-6 py-3 bg-card border-4 border-foreground/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
            <p className="text-xl font-black uppercase tracking-wide">
              {gameState.currentCategory?.name} - {gameState.session.currentDifficulty}
            </p>
          </Card>
        </div>

        {/* Question Card */}
        <Card className="p-8 mb-8 bg-card border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
          <h2 className="text-3xl font-bold text-center mb-8 text-foreground">
            {question.questionText}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option) => {
              const isSelected = selectedAnswer === option.letter;
              const isThisCorrect = showResult && correctAnswer === option.letter;
              const isThisWrong = showResult && isSelected && !isCorrect;

              let buttonClass = "bg-card hover:bg-muted";
              if (isThisCorrect) {
                buttonClass = "bg-secondary border-secondary";
              } else if (isThisWrong) {
                buttonClass = "bg-destructive border-destructive text-destructive-foreground";
              } else if (isSelected) {
                buttonClass = "bg-primary border-primary";
              }

              return (
                <Button
                  key={option.letter}
                  onClick={() => handleAnswerSelect(option.letter)}
                  disabled={showResult}
                  className={`text-left p-6 h-auto text-lg font-bold uppercase border-4 border-foreground/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all ${buttonClass}`}
                >
                  <span className="text-2xl font-black mr-4">{option.letter}.</span>
                  {option.text}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Submit Button */}
        {!showResult && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || submitAnswerMutation.isPending}
              className="text-2xl font-black uppercase px-12 py-6 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 border-4 border-foreground/20"
            >
              {submitAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
            </Button>
          </div>
        )}

        {/* Result Message */}
        {showResult && (
          <div className="text-center">
            <p className={`text-3xl font-black uppercase ${isCorrect ? "text-secondary" : "text-destructive"}`}>
              {isCorrect ? "✓ Correct!" : "✗ Incorrect!"}
            </p>
            {!isCorrect && (
              <p className="text-xl font-bold mt-2">
                The correct answer was: <span className="text-secondary">{correctAnswer}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
