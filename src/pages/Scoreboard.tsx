import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Star, Crown, ChevronRight, Sparkles } from "lucide-react";

interface ScoreboardEntry {
  id: string;
  startup_name: string | null;
  category: string | null;
  confidence_score: number | null;
  idea: string;
  created_at: string;
  logo_url: string | null;
}

const rankStyles = [
  { bg: "bg-yellow-500/15", border: "border-yellow-500/40", text: "text-yellow-500", icon: Crown },
  { bg: "bg-slate-300/15", border: "border-slate-400/40", text: "text-slate-400", icon: Medal },
  { bg: "bg-amber-700/15", border: "border-amber-700/40", text: "text-amber-700", icon: Medal },
];

const Scoreboard = () => {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTop = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("generation_metrics")
        .select("id, startup_name, category, confidence_score, idea, created_at, logo_url")
        .not("confidence_score", "is", null)
        .neq("record_type", "battle")
        .order("confidence_score", { ascending: false })
        .limit(20);
      if (data) setEntries(data as ScoreboardEntry[]);
      setLoading(false);
    };
    fetchTop();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Scoreboard
          </div>
          <h1 className="text-4xl font-black mb-2">
            <span className="gradient-text">Top Startups</span>
          </h1>
          <p className="text-muted-foreground">The highest-rated startup ideas, ranked by confidence score.</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading scoreboard...
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">No startups yet</h2>
            <p className="text-muted-foreground">Generate some startups to see them ranked here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, i) => {
              const style = i < 3 ? rankStyles[i] : null;
              const RankIcon = style?.icon ?? Star;

              return (
                <button
                  key={entry.id}
                  onClick={() => navigate(`/startup/${entry.id}`)}
                  className={`w-full text-left group rounded-2xl border bg-card p-5 transition-all hover:bg-primary/5 ${style ? `${style.border}` : "border-border/60 hover:border-primary/40"}`}>
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${style ? `${style.bg} ${style.text}` : "bg-secondary text-muted-foreground"}`}>
                      {i < 3 ? <RankIcon className="w-5 h-5" /> : `#${i + 1}`}
                    </div>

                    {/* Logo or emoji */}
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                      {entry.logo_url ? <img src={entry.logo_url} alt="" className="w-full h-full object-cover rounded-xl" /> : "🚀"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`font-bold truncate ${i < 3 ? "text-foreground" : ""}`}>{entry.startup_name ?? "Untitled"}</span>
                        {entry.category && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">{entry.category}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{entry.idea}</p>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0">
                      <div className={`text-2xl font-black ${i < 3 ? "gradient-text" : "text-muted-foreground"}`}>{entry.confidence_score}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                        <Star className="w-3 h-3" /> Score
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scoreboard;
