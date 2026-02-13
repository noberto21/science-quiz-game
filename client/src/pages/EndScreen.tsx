import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GeometricBackground } from "@/components/GeometricBackground";
import { useLocation } from "wouter";
import { Trophy, Star } from "lucide-react";

export default function EndScreen() {
  const [, setLocation] = useLocation();

  // Get final score from sessionStorage (set by QuizScreen)
  const finalScore = parseInt(sessionStorage.getItem("finalScore") || "0");
  const totalQuestions = 3; // 3 difficulty levels per subject
  const pointsPerQuestion = 5;
  const maxPossibleScore = totalQuestions * pointsPerQuestion; // 15 points

  const handlePlayAgain = () => {
    sessionStorage.removeItem("finalScore");
    setLocation("/");
  };

  const handlePlayAnotherSubject = () => {
    sessionStorage.removeItem("finalScore");
    setLocation("/subjects");
  };

  const handleExit = () => {
    window.close();
  };

  // Calculate performance message
  const percentage = (finalScore / maxPossibleScore) * 100;
  let performanceMessage = "";
  let performanceColor = "";

  if (percentage >= 80) {
    performanceMessage = "Outstanding! You're a Lacon Master!";
    performanceColor = "text-secondary";
  } else if (percentage >= 60) {
    performanceMessage = "Great Job! Keep Learning!";
    performanceColor = "text-primary";
  } else if (percentage >= 40) {
    performanceMessage = "Good Effort! Practice Makes Perfect!";
    performanceColor = "text-accent";
  } else {
    performanceMessage = "Keep Trying! You'll Get Better!";
    performanceColor = "text-foreground";
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <GeometricBackground />

      <div className="relative z-10 text-center space-y-8 px-4 max-w-2xl">
        {/* Trophy Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <Trophy className="w-32 h-32 text-accent animate-bounce-subtle" />
            <Star className="w-12 h-12 text-primary absolute -top-2 -right-2 animate-spin" style={{ animationDuration: "3s" }} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-wider text-shadow-lg text-foreground">
          Game Complete!
        </h1>

        {/* Score Card */}
        <Card className="p-8 bg-card border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="space-y-4">
            <p className="text-2xl font-bold uppercase tracking-wide text-foreground/80">
              Your Final Score
            </p>
            <p className="text-7xl font-black text-primary text-shadow-md">
              {finalScore} / {maxPossibleScore}
            </p>
            <p className={`text-2xl font-bold uppercase tracking-wide ${performanceColor}`}>
              {performanceMessage}
            </p>
          </div>
        </Card>

        {/* Score Breakdown */}
        <Card className="p-6 bg-card border-4 border-foreground/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm font-bold uppercase text-foreground/60">Math</p>
              <p className="text-2xl font-black text-chart-1">✓</p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-foreground/60">Chemistry</p>
              <p className="text-2xl font-black text-chart-2">✓</p>
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-foreground/60">Biology</p>
              <p className="text-2xl font-black text-chart-3">✓</p>
            </div>
          </div>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-4 flex-wrap">
          <Button
            size="lg"
            onClick={handlePlayAnotherSubject}
            className="text-2xl font-black uppercase px-12 py-8 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 border-4 border-foreground/20"
          >
            Play Another Subject
          </Button>

          <Button
            size="lg"
            onClick={handlePlayAgain}
            className="text-2xl font-black uppercase px-12 py-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 border-4 border-foreground/20"
          >
            Play Again
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleExit}
            className="text-2xl font-black uppercase px-12 py-8 rounded-2xl bg-card text-card-foreground hover:bg-card/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 border-4 border-foreground/20"
          >
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
