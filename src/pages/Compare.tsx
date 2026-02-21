import React, { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { supabase } from "@/integrations/supabase/client";
import { StartupBlueprint } from "@/types/startup";
import { GitCompareArrows, X, Plus, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  id: string;
  startup_name: string | null;
  category: string | null;
  confidence_score: number | null;
  result_json: StartupBlueprint | null;
}

const MAX_COMPARE = 3;

const Compare = () => {
  const [allItems, setAllItems] = useState<HistoryItem[]>([]);
  const [selected, setSelected] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("generation_metrics")
        .select("id, startup_name, category, confidence_score, result_json")
        .neq("record_type", "battle")
        .not("result_json", "is", null)
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setAllItems(data as HistoryItem[]);
      setLoading(false);
    };
    fetch();
  }, []);

  const addItem = (item: HistoryItem) => {
    if (selected.length >= MAX_COMPARE) return;
    if (selected.find((s) => s.id === item.id)) return;
    setSelected([...selected, item]);
    setShowPicker(false);
  };

  const removeItem = (id: string) => {
    setSelected(selected.filter((s) => s.id !== id));
  };

  const available = allItems.filter((a) => !selected.find((s) => s.id === a.id));
  const startups = selected.map((s) => s.result_json).filter(Boolean) as StartupBlueprint[];

  const comparisonRows: { label: string; getValue: (s: StartupBlueprint) => string }[] = [
    { label: "Tagline", getValue: (s) => s.tagline },
    { label: "Category", getValue: (s) => s.category },
    { label: "Confidence Score", getValue: (s) => `${s.confidenceScore}/100` },
    { label: "Target Persona", getValue: (s) => `${s.targetPersona.name}, ${s.targetPersona.age}` },
    { label: "Pain Points", getValue: (s) => s.targetPersona.painPoints.join("; ") },
    { label: "Core Features", getValue: (s) => s.coreFeatures.map((f) => f.name).join(", ") },
    { label: "Pricing Model", getValue: (s) => s.pricingModel.type },
    { label: "Pricing Tiers", getValue: (s) => s.pricingModel.tiers.map((t) => `${t.name}: ${t.price}`).join(", ") },
    { label: "Frontend Stack", getValue: (s) => s.techStack.frontend.join(", ") },
    { label: "Backend Stack", getValue: (s) => s.techStack.backend.join(", ") },
    { label: "AI Stack", getValue: (s) => s.techStack.ai.join(", ") },
    { label: "Market Size", getValue: (s) => s.investorPitch.marketSize },
    { label: "Unique Advantage", getValue: (s) => s.investorPitch.uniqueAdvantage },
    { label: "The Ask", getValue: (s) => s.investorPitch.ask },
  ];

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <GitCompareArrows className="w-4 h-4" />
            Compare Mode
          </div>
          <h1 className="text-4xl font-black mb-2">
            <span className="gradient-text">Side-by-Side</span>
          </h1>
          <p className="text-muted-foreground">Select up to {MAX_COMPARE} startups to compare in detail.</p>
        </div>

        {/* Selection area */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {selected.map((item) => (
            <div key={item.id} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-primary/30">
              <span className="font-semibold text-sm">{item.startup_name ?? "Untitled"}</span>
              {item.confidence_score != null && (
                <span className="text-xs text-primary flex items-center gap-0.5">
                  <Star className="w-3 h-3" />
                  {item.confidence_score}
                </span>
              )}
              <button onClick={() => removeItem(item.id)} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {selected.length < MAX_COMPARE && (
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => setShowPicker(!showPicker)} className="gap-1.5 border-dashed border-border/80">
                <Plus className="w-4 h-4" />
                Add Startup
              </Button>

              {showPicker && (
                <div className="absolute top-full mt-2 left-0 z-50 w-72 max-h-64 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-xl p-2">
                  {loading ? (
                    <p className="text-sm text-muted-foreground p-3">Loading...</p>
                  ) : available.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-3">No more startups available.</p>
                  ) : (
                    available.map((item) => (
                      <button key={item.id} onClick={() => addItem(item)} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{item.startup_name ?? "Untitled"}</span>
                          {item.confidence_score != null && <span className="text-xs text-muted-foreground ml-2">{item.confidence_score}/100</span>}
                        </div>
                        {item.category && <span className="text-xs text-muted-foreground">{item.category}</span>}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison table */}
        {startups.length >= 2 ? (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left p-4 text-muted-foreground font-semibold w-40 shrink-0">Attribute</th>
                    {startups.map((s, i) => (
                      <th key={i} className="text-left p-4 min-w-[200px]">
                        <span className="font-black text-base gradient-text">{s.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? "bg-secondary/20" : ""}>
                      <td className="p-4 text-muted-foreground font-medium whitespace-nowrap">{row.label}</td>
                      {startups.map((s, si) => (
                        <td key={si} className="p-4 text-foreground">
                          {row.getValue(s)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Sparkles className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground">{selected.length === 0 ? "Add at least 2 startups to start comparing." : "Add one more startup to see the comparison."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
