import { Button } from "@/components/ui/button";
import { GeometricBackground } from "@/components/GeometricBackground";
import { useLocation } from "wouter";

export default function StartScreen() {
  const [, setLocation] = useLocation();

  const handleStartGame = () => {
    setLocation("/game");
  };

  const handleExit = () => {
    window.close();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <GeometricBackground />
      
      <div className="relative z-10 text-center space-y-12 px-4">
        {/* Game Title */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-wider text-shadow-lg text-foreground">
            Science
          </h1>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-wider text-shadow-lg text-foreground">
            Quiz
          </h1>
          <h1 className="text-6xl md:text-8xl font-black uppercase tracking-wider text-shadow-lg text-foreground">
            Game
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl font-bold uppercase tracking-wide text-foreground/80">
          Test Your Knowledge Across Math, Chemistry & Biology
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            size="lg"
            onClick={handleStartGame}
            className="text-2xl font-black uppercase px-12 py-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-1 border-4 border-foreground/20"
          >
            Start Game
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

        {/* Decorative dots */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="w-4 h-4 rounded-full bg-primary"></div>
          <div className="w-4 h-4 rounded-full bg-secondary"></div>
          <div className="w-4 h-4 rounded-full bg-accent"></div>
        </div>
      </div>
    </div>
  );
}
