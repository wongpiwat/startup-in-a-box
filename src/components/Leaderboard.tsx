import React from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Star, TrendingUp, Clock, ExternalLink } from "lucide-react";

interface MetricRow {
  id: string;
  created_at: string;
  idea: string;
  startup_name: string;
  category: string;
  generation_time_ms: number;
  total_tokens: number;
  output_length: number;
  confidence_score: number;
}

interface Props {
  metrics: MetricRow[];
  loading: boolean;
}

const MEDAL = ["🥇", "🥈", "🥉"];

const Leaderboard = ({ metrics, loading }: Props) => {
  const navigate = useNavigate();

  if (loading) return (
    <div className="text-center py-20 text-muted-foreground">
      <div className="inline-flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        Loading leaderboard...
      </div>
    </div>
  );

  const ranked = [...metrics]
    .filter(m => m.confidence_score > 0 && m.startup_name)
    .sort((a, b) => b.confidence_score - a.confidence_score)
    .slice(0, 20);

  if (ranked.length === 0) return (
    <div className="text-center py-20">
      <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">No entries yet</h2>
      <p className="text-muted-foreground">Generate startups to populate the leaderboard.</p>
    </div>
  );

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-1 flex items-center gap-3">
          <Trophy className="w-8 h-8 text-primary" />
          Confidence Score Leaderboard
        </h2>
        <p className="text-muted-foreground">Top-rated AI-generated startup blueprints, ranked by confidence score</p>
      </div>

      {/* Top 3 podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[top3[1], top3[0], top3[2]].map((m, podiumIdx) => {
          if (!m) return <div key={podiumIdx} />;
          const rank = podiumIdx === 1 ? 1 : podiumIdx === 0 ? 2 : 3;
          const heights = ["h-24", "h-32", "h-20"];
          return (
            <button
              key={m.id}
              onClick={() => navigate("/", { state: { startup: null, id: m.id } })}
              className="flex flex-col items-center text-center group"
            >
              <div className={`text-3xl mb-2 ${rank === 1 ? "text-4xl" : ""}`}>{MEDAL[rank - 1]}</div>
              <div className={`w-full rounded-t-2xl ${heights[podiumIdx]} ${rank === 1 ? "bg-primary/20 border-2 border-primary/40" : "bg-secondary/50 border border-border/60"} flex items-end justify-center pb-3 relative transition-all group-hover:opacity-80`}>
                <div className="absolute -top-6 w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center text-xl">🚀</div>
              </div>
              <div className={`w-full rounded-b-2xl p-3 ${rank === 1 ? "bg-primary/10 border-x-2 border-b-2 border-primary/40" : "bg-secondary/30 border border-t-0 border-border/60"}`}>
                <p className="font-bold text-sm truncate">{m.startup_name}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className={`w-3 h-3 ${rank === 1 ? "text-primary fill-current" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-bold ${rank === 1 ? "gradient-text" : "text-muted-foreground"}`}>{m.confidence_score}</span>
                </div>
                {m.category && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.category}</p>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Ranked list */}
      <div className="space-y-2">
        {rest.map((m, i) => {
          const rank = i + 4;
          return (
            <button
              key={m.id}
              onClick={() => navigate("/startup/" + m.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
            >
              <span className="w-8 text-center font-bold text-muted-foreground text-sm shrink-0">#{rank}</span>
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg shrink-0">🚀</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold truncate">{m.startup_name}</span>
                  {m.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">
                      {m.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{m.idea}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-3.5 h-3.5 text-primary" />
                    <span className="font-bold text-foreground">{m.confidence_score}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {(m.generation_time_ms / 1000).toFixed(1)}s
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    {m.total_tokens?.toLocaleString()}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Showing top {ranked.length} startup{ranked.length !== 1 ? "s" : ""} by confidence score
      </p>
    </div>
  );
};

export default Leaderboard;
