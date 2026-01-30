import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GeometricBackground } from "@/components/GeometricBackground";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function SubjectSelection() {
  const [, setLocation] = useLocation();
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get all categories
  const { data: categories, isLoading: categoriesLoading } = trpc.game.getCategories.useQuery();

  // Start game mutation
  const startGameMutation = trpc.game.startGame.useMutation();

  const handleSelectSubject = async (categoryId: number) => {
    setSelectedSubject(categoryId);
    setIsLoading(true);

    try {
      const result = await startGameMutation.mutateAsync({ categoryId });
      sessionStorage.setItem("sessionId", result.sessionId.toString());
      setLocation("/quiz");
    } catch (error) {
      console.error("Failed to start game:", error);
      setIsLoading(false);
      setSelectedSubject(null);
    }
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden py-8 flex items-center justify-center">
        <GeometricBackground />
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <GeometricBackground />

      <div className="container relative z-10 max-w-4xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black uppercase tracking-wider mb-4 text-foreground drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
            Choose Your Subject
          </h1>
          <p className="text-2xl font-bold text-foreground/80">
            Select a subject to begin the quiz
          </p>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories?.map((category) => (
            <Card
              key={category.id}
              className={`p-8 border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] cursor-pointer transition-all hover:scale-105 ${
                selectedSubject === category.id
                  ? "bg-primary border-primary/50 scale-105"
                  : "bg-card hover:bg-card/80"
              }`}
              onClick={() => !isLoading && handleSelectSubject(category.id)}
            >
              <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-wide mb-4 text-foreground">
                  {category.name}
                </h2>
                <p className="text-lg font-bold text-foreground/70">
                  Click to select
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="px-8 py-6 text-lg font-black uppercase"
            disabled={isLoading}
          >
            Back to Home
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-8 rounded-lg border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
              <Loader2 className="animate-spin w-12 h-12 mx-auto mb-4" />
              <p className="text-xl font-black uppercase">Starting Quiz...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
