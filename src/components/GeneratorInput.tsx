import React, { useState } from "react";
import { Sparkles, Zap, Lightbulb, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StartupBlueprint, GenerationMetrics } from "@/types/startup";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIZED_IDEAS: { category: string; emoji: string; ideas: string[] }[] = [
  {
    category: "AI & Tech",
    emoji: "🤖",
    ideas: [
      "AI for fitness coaches",
      "AI legal document reviewer",
      "AI-powered resume builder for developers",
      "AI tutor for learning new languages",
      "AI recipe generator from fridge photos",
      "AI meeting summarizer for remote teams",
      "AI-powered code review tool",
    ],
  },
  {
    category: "Marketplaces",
    emoji: "🏪",
    ideas: [
      "Marketplace for freelance architects",
      "On-demand home repair marketplace",
      "Subscription box for indie board games",
      "Local farm-to-table food delivery",
      "Handmade crafts marketplace for artisans",
    ],
  },
  {
    category: "Health & Wellness",
    emoji: "💚",
    ideas: [
      "Mental health app for Gen Z",
      "Pet health monitoring wearable",
      "Elderly care coordination platform",
      "Sleep quality tracker with smart alarm",
      "Virtual physical therapy platform",
    ],
  },
  {
    category: "Finance & Business",
    emoji: "💰",
    ideas: [
      "Micro-investing app for students",
      "Freelancer invoice & tax automation",
      "Smart inventory for restaurants",
      "Expense splitting app for roommates",
      "AI-powered financial advisor for freelancers",
    ],
  },
  {
    category: "Sustainability & Lifestyle",
    emoji: "🌱",
    ideas: [
      "Carbon tracking for SMBs",
      "Sustainable fashion rental service",
      "Smart parking finder for urban drivers",
      "Remote team culture platform",
      "Zero-waste grocery planning app",
      "EV charging station finder & planner",
    ],
  },
  {
    category: "Education",
    emoji: "📚",
    ideas: [
      "Gamified coding bootcamp for kids",
      "Peer-to-peer tutoring marketplace",
      "AI-generated study guides from textbooks",
      "Interactive STEM lab simulator",
      "Language exchange social network",
    ],
  },
  {
    category: "Creator Economy",
    emoji: "🎨",
    ideas: [
      "Podcast analytics & monetization platform",
      "Newsletter growth toolkit for writers",
      "Digital art licensing marketplace",
      "Fan engagement platform for musicians",
      "Video course builder with AI editing",
    ],
  },
  {
    category: "SaaS & Productivity",
    emoji: "⚡",
    ideas: [
      "No-code workflow automation for agencies",
      "Client portal for consultants",
      "Smart scheduling for service businesses",
      "OKR tracking tool for startups",
      "AI-powered customer feedback analyzer",
    ],
  },
];

const ALL_IDEAS = CATEGORIZED_IDEAS.flatMap((c) => c.ideas);

interface GeneratorInputProps {
  onResult: (startup: StartupBlueprint, metrics: GenerationMetrics, id?: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const GeneratorInput = ({ onResult, loading, setLoading }: GeneratorInputProps) => {
  const [idea, setIdea] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleGenerate = async (ideaToUse?: string) => {
    const finalIdea = ideaToUse ?? idea;
    if (!finalIdea.trim()) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-startup", {
        body: { idea: finalIdea.trim() },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      onResult(data.startup, data.metrics, data.id ?? undefined);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Generation failed";
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

  const visibleIdeas = activeCategory
    ? (CATEGORIZED_IDEAS.find((c) => c.category === activeCategory)?.ideas ?? [])
    : ALL_IDEAS;

  return (
    <main className="flex flex-col items-center justify-center px-6 py-6 h-[calc(100vh-4rem)] overflow-hidden">
      <div className="text-center mb-5 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-4">
          <Zap className="w-3.5 h-3.5" />
          Powered by Amazon Bedrock + Gemini
        </div>
        <h1 className="text-5xl md:text-6xl font-black mb-3 leading-none tracking-tight">
          <span className="gradient-text">Startup in a Box</span>
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Turn any business idea into a complete startup blueprint in seconds — name, features, pricing, tech stack, roadmap, and pitch.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <div className="relative rounded-2xl border border-border/60 bg-card p-2 shadow-2xl">
          <div className="flex items-center gap-3 p-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0" />
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="e.g. AI for fitness coaches..."
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground outline-none"
              disabled={loading}
            />
            <Button
              onClick={() => handleGenerate()}
              disabled={loading || !idea.trim()}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 gap-2 font-semibold"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate <Sparkles className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-3 mb-3">
            <Lightbulb className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Try one of these:</span>
            <button
              onClick={() => {
                const random = ALL_IDEAS[Math.floor(Math.random() * ALL_IDEAS.length)];
                setIdea(random);
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <Shuffle className="w-3 h-3" />
              Random Idea
            </button>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setActiveCategory(null)}
              disabled={loading}
              className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all disabled:opacity-50 ${
                activeCategory === null
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-secondary/50 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              All
            </button>
            {CATEGORIZED_IDEAS.map(({ category, emoji }) => (
              <button
                key={category}
                onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                disabled={loading}
                className={`px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all disabled:opacity-50 ${
                  activeCategory === category
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-secondary/50 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {emoji} {category}
              </button>
            ))}
          </div>

          {/* Idea chips - limited to fit viewport */}
          <div className="flex flex-wrap gap-2 max-h-[9rem] overflow-y-auto scrollbar-thin">
            {visibleIdeas.map((ex) => (
              <button
                key={ex}
                onClick={() => setIdea(ex)}
                disabled={loading}
                className="px-3 py-2 rounded-full border border-border/60 bg-secondary/50 text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/10 transition-all disabled:opacity-50"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/60">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">Building your startup blueprint with AI...</span>
          </div>
        </div>
      )}
    </main>
  );
};

export default GeneratorInput;
