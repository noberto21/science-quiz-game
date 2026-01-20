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

  // Reset hint state when question changes
  useEffect(() => {
    setHintUsed(false);
    setEliminatedOptions([]);
    setHintMessage("");
    setSelectedAnswer(null);
  }, [questionData?.question?.id]);

  const handleAnswerSelect = (answer: "A" | "B" | "C" | "D") => {
    if (!showResult) {
      setSelectedAnswer(answer);
    }
  };

  const handleGetHint = async () => {
    if (!questionData?.question || !sessionId || hintUsed) return;

    try {
      const result = await getHintMutation.mutateAsync({
        sessionId,
        questionId: questionData.question.id,
      });

      setHintUsed(true);
      setEliminatedOptions(result.eliminatedOptions);
      setHintMessage(`Hint: ${result.hintPenalty} point deducted. Score now: ${result.newScore}`);
      
      // Refetch game state to update score display
      await refetchGameState();
    } catch (error) {
      console.error("Failed to get hint:", error);
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

      // Play sound and trigger animation
      if (result.isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Wait 2 seconds then move to next question
      setTimeout(() => {
        if (result.gameCompleted) {
          playCelebrationSound();
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
              const isEliminated = eliminatedOptions.includes(option.letter);

              let buttonClass = "bg-card hover:bg-muted";
              let animationClass = "";

              if (isEliminated) {
                buttonClass = "bg-muted opacity-50 cursor-not-allowed hover:bg-muted";
              } else if (isThisCorrect) {
                buttonClass = "bg-secondary border-secondary";
                if (showResult) {
                  animationClass = "animate-pulse-correct";
                }
              } else if (isThisWrong) {
                buttonClass = "bg-destructive border-destructive text-destructive-foreground";
                if (showResult) {
                  animationClass = "animate-shake-wrong";
                }
              } else if (isSelected) {
                buttonClass = "bg-primary border-primary";
                if (showResult && !isCorrect) {
                  animationClass = "animate-shake-wrong";
                }
              }

              return (
                <Button
                  key={option.letter}
                  onClick={() => !isEliminated && handleAnswerSelect(option.letter)}
                  disabled={showResult || isEliminated}
                  className={`text-left p-6 h-auto text-lg font-bold uppercase border-4 border-foreground/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] transition-all ${buttonClass} ${animationClass}`}
                >
                  <span className="text-2xl font-black mr-4">{option.letter}.</span>
                  {option.text}
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Hint Message */}
        {hintMessage && (
          <Card className="p-4 mb-4 bg-accent/20 border-4 border-accent shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]">
            <p className="text-center font-bold text-accent-foreground">{hintMessage}</p>
          </Card>
        )}

        {/* Hint and Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {!showResult && (
            <Button
              size="lg"
              onClick={handleGetHint}
              disabled={hintUsed || showResult || getHintMutation.isPending}
              className="text-xl font-black uppercase px-8 py-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 border-4 border-foreground/20 flex items-center gap-2"
            >
              <Lightbulb className="w-6 h-6" />
              {hintUsed ? "Hint Used" : "Get Hint"}
            </Button>
          )}

          {!showResult && (
            <Button
              size="lg"
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer || submitAnswerMutation.isPending}
              className="text-2xl font-black uppercase px-12 py-6 rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 border-4 border-foreground/20"
            >
              {submitAnswerMutation.isPending ? "Submitting..." : "Submit Answer"}
            </Button>
          )}
        </div>

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
