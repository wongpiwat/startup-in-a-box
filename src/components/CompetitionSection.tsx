import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ExternalLink, Shield, Swords, Search, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Competitor {
  name: string;
  description: string;
  website: string;
  founded: string;
  funding: string;
  strengths: string[];
  weaknesses: string[];
  similarity: number;
}

interface CompetitorData {
  competitors: Competitor[];
  marketInsight: string;
  threatLevel: "low" | "medium" | "high";
}

interface Props {
  idea: string;
  startupName: string;
  category: string;
  startupId?: string;
}

const threatColors: Record<string, string> = {
  low: "text-green-400 bg-green-400/10 border-green-400/30",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  high: "text-destructive bg-destructive/10 border-destructive/30",
};

const CompetitorCard = ({ competitor }: { competitor: Competitor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/30 p-5 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{competitor.name}</h3>
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{competitor.description}</p>
        </div>
        <div className="flex flex-col items-center shrink-0">
          <div className="relative w-12 h-12">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" className="text-border/40" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="3"
                strokeDasharray={`${(competitor.similarity / 100) * 94.25} 94.25`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
              {competitor.similarity}%
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground mt-0.5">Similar</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
        <span>Founded: {competitor.founded}</span>
        <span>•</span>
        <span>{competitor.funding}</span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Hide" : "Show"} strengths & weaknesses
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-3 mt-3 animate-in fade-in-0 slide-in-from-top-1">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-green-400 mb-1.5">Strengths</p>
            <ul className="space-y-1">
              {competitor.strengths.map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">+</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-destructive mb-1.5">Weaknesses</p>
            <ul className="space-y-1">
              {competitor.weaknesses.map((w, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className="text-destructive mt-0.5">−</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

const CompetitionSection = ({ idea, startupName, category, startupId }: Props) => {
  const [data, setData] = useState<CompetitorData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load saved competitor data on mount
  useEffect(() => {
    if (!startupId) return;
    const loadSaved = async () => {
      const { data: row } = await (supabase as any)
        .from("generation_metrics")
        .select("result_json")
        .eq("id", startupId)
        .single();
      const saved = row?.result_json?.competitorAnalysis;
      if (saved) {
        setData(saved);
        setLoaded(true);
      }
    };
    loadSaved();
  }, [startupId]);

  const saveToDb = async (competitorData: CompetitorData) => {
    if (!startupId) return;
    // Merge into existing result_json
    const { data: row } = await (supabase as any)
      .from("generation_metrics")
      .select("result_json")
      .eq("id", startupId)
      .single();
    if (row?.result_json) {
      await (supabase as any)
        .from("generation_metrics")
        .update({ result_json: { ...row.result_json, competitorAnalysis: competitorData } })
        .eq("id", startupId);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("analyze-competitors", {
        body: { idea, startupName, category },
      });
      if (error) throw new Error(error.message);
      if (result?.error) throw new Error(result.error);
      setData(result);
      setLoaded(true);
      await saveToDb(result);
      toast.success("Competitor analysis saved!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      if (msg.includes("429") || msg.toLowerCase().includes("rate limit")) {
        toast.error("Rate limit reached — please wait a moment and try again.");
      } else if (msg.includes("402") || msg.toLowerCase().includes("credits")) {
        toast.error("Credits needed — add funds in Settings → Workspace → Usage.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg">Competition</h2>
        </div>
        {!loaded && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={loading}
            className="gap-1.5 text-xs border-border/60 hover:border-primary/40"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Analyze Competitors
              </>
            )}
          </Button>
        )}
      </div>

      {!loaded && !loading && (
        <p className="text-sm text-muted-foreground">
          Click "Analyze Competitors" to discover real companies and products in this space using AI.
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="inline-flex items-center gap-3 text-muted-foreground text-sm">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            Researching the competitive landscape...
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-5 animate-in fade-in-0 slide-in-from-bottom-2">
          {/* Threat level + insight */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-secondary/30">
            <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-foreground">Market Insight</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${threatColors[data.threatLevel] || threatColors.medium}`}>
                  {data.threatLevel} threat
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{data.marketInsight}</p>
            </div>
          </div>

          {/* Competitor cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {data.competitors.map((c, i) => (
              <CompetitorCard key={i} competitor={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitionSection;
