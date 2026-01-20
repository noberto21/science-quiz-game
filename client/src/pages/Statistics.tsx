import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GeometricBackground } from "@/components/GeometricBackground";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2, BarChart3, Clock, Target, TrendingUp } from "lucide-react";

export default function Statistics() {
  const [, setLocation] = useLocation();
  const { data: stats, isLoading } = trpc.game.getStatistics.useQuery();

  const formatTime = (seconds: number | null | undefined): string => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const calculateAccuracy = (correct: number | null | undefined, total: number | null | undefined): string => {
    if (!correct || !total || total === 0) return "0%";
    return `${Math.round((correct / total) * 100)}%`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <GeometricBackground />

      <div className="container relative z-10 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black uppercase text-foreground drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)]">
            Your Statistics
          </h1>
          <Button
            onClick={() => setLocation("/")}
            className="text-lg font-black uppercase px-8 py-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] border-4 border-foreground/20"
          >
            Back to Menu
          </Button>
        </div>

        {/* Overall Statistics */}
        {stats?.overall && (
          <Card className="p-8 mb-8 bg-card border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black uppercase mb-6 text-foreground flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-primary" />
              Overall Performance
            </h2>

            {(() => {
              const totalGames = Number(stats.overall.totalGames || 0);
              const totalCorrect = Number(stats.overall.totalCorrect || 0);
              const totalQuestions = Number(stats.overall.totalQuestions || 0);
              const fastestTime = Number(stats.overall.fastestTime || 0) || null;
              const averageTime = Number(stats.overall.averageTime || 0) || null;

              return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-secondary/20 p-6 rounded-xl border-4 border-secondary/30">
                <p className="text-sm font-bold uppercase text-foreground/70 mb-2">Total Games</p>
                <p className="text-4xl font-black text-secondary">{totalGames || 0}</p>
              </div>

              <div className="bg-accent/20 p-6 rounded-xl border-4 border-accent/30">
                <p className="text-sm font-bold uppercase text-foreground/70 mb-2">Accuracy</p>
                <p className="text-4xl font-black text-accent">
                  {calculateAccuracy(totalCorrect, totalQuestions)}
                </p>
              </div>

              <div className="bg-primary/20 p-6 rounded-xl border-4 border-primary/30">
                <p className="text-sm font-bold uppercase text-foreground/70 mb-2">Fastest Time</p>
                <p className="text-2xl font-black text-primary">{formatTime(fastestTime)}</p>
              </div>

              <div className="bg-yellow-300/20 p-6 rounded-xl border-4 border-yellow-300/30">
                <p className="text-sm font-bold uppercase text-foreground/70 mb-2">Average Time</p>
                <p className="text-2xl font-black text-yellow-600">{formatTime(averageTime)}</p>
              </div>
            </div>
              );
            })()}
          </Card>
        )}

        {/* Category Performance */}
        {stats?.byCategory && stats.byCategory.length > 0 && (
          <Card className="p-8 mb-8 bg-card border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black uppercase mb-6 text-foreground flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-primary" />
              Category Performance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.byCategory.map((cat: any) => {
                const catTotalCorrect = Number(cat.totalCorrect || 0);
                const catTotalQuestions = Number(cat.totalQuestions || 0);
                const catFastestTime = Number(cat.fastestTime || 0) || null;
                const catAverageTime = Number(cat.averageTime || 0) || null;
                return (
                <div
                  key={cat.categoryId}
                  className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-xl border-4 border-foreground/20 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                >
                  <h3 className="text-xl font-black uppercase mb-4 text-foreground">{cat.categoryName}</h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold uppercase">Games Played</span>
                      <span className="font-black text-lg text-primary">{cat.totalGames || 0}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold uppercase">Accuracy</span>
                      <span className="font-black text-lg text-accent">
                        {calculateAccuracy(catTotalCorrect, catTotalQuestions)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold uppercase">Best Time</span>
                      <span className="font-black text-lg text-secondary">{formatTime(catFastestTime)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold uppercase">Avg Time</span>
                      <span className="font-black text-lg text-yellow-600">{formatTime(catAverageTime)}</span>
                    </div>

                    {cat.lastPlayed && (
                      <div className="text-xs text-foreground/60 mt-2">
                        Last played: {new Date(cat.lastPlayed).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent Games */}
        {stats?.recentGames && stats.recentGames.length > 0 && (
          <Card className="p-8 bg-card border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
            <h2 className="text-2xl font-black uppercase mb-6 text-foreground flex items-center gap-2">
              <Clock className="w-8 h-8 text-primary" />
              Recent Games
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-4 border-foreground/20">
                    <th className="text-left p-4 font-black uppercase">Category</th>
                    <th className="text-center p-4 font-black uppercase">Score</th>
                    <th className="text-center p-4 font-black uppercase">Accuracy</th>
                    <th className="text-center p-4 font-black uppercase">Time</th>
                    <th className="text-right p-4 font-black uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentGames.map((game: any, index: number) => (
                    <tr
                      key={game.id}
                      className={`border-b-2 border-foreground/10 ${index % 2 === 0 ? "bg-foreground/5" : ""}`}
                    >
                      <td className="p-4 font-bold">{game.categoryName}</td>
                      <td className="p-4 text-center font-black text-primary">
                        {game.score}/{game.questionsAnswered}
                      </td>
                      <td className="p-4 text-center font-black text-accent">
                        {calculateAccuracy(game.score, game.questionsAnswered)}
                      </td>
                      <td className="p-4 text-center font-bold">{formatTime(game.durationSeconds)}</td>
                      <td className="p-4 text-right text-sm">
                        {game.completedAt ? new Date(game.completedAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {(!stats?.overall || (!stats?.byCategory?.length && !stats?.recentGames?.length)) && (
          <Card className="p-12 bg-card border-4 border-foreground/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-primary/50" />
            <p className="text-2xl font-bold uppercase text-foreground/70">No statistics yet</p>
            <p className="text-lg text-foreground/60 mt-2">Complete some games to see your performance data!</p>
            <Button
              onClick={() => setLocation("/")}
              className="mt-6 text-lg font-black uppercase px-8 py-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] border-4 border-foreground/20"
            >
              Start Playing
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
