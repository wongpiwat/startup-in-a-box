import { useState } from "react";
import { Star, Info, X } from "lucide-react";
import { EvaluationScores as EvaluationScoresType } from "@/types/startup";

interface ScoreRingProps {
  value: number;
  label: string;
  size?: number;
  onClick?: () => void;
}

const getScoreStrokeClass = (value: number): string => {
  if (value >= 8) return "stroke-emerald-500";
  if (value >= 4) return "stroke-amber-500";
  return "stroke-rose-500";
};

const getScoreTextClass = (value: number): string => {
  if (value >= 8) return "text-emerald-500";
  if (value >= 4) return "text-amber-500";
  return "text-rose-500";
};

const ScoreRing = ({ value, label, size = 56, onClick }: ScoreRingProps) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 10) * circumference;

  return (
    <div
      className={`flex flex-col items-center gap-1.5 ${onClick ? "cursor-pointer hover:scale-105 transition-transform" : ""}`}
      onClick={onClick}
    >
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-muted/40" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={getScoreStrokeClass(value)} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress} style={{ transition: "stroke-dashoffset 0.8s ease-out" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">{value}</span>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
};

const OverallRing = ({ value, size = 96 }: { value: number; size?: number }) => {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / 10) * circumference;
  const rating = value >= 8 ? "Excellent" : value >= 6 ? "Good" : value >= 4 ? "Fair" : "Weak";

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className="stroke-muted/30" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" className={getScoreStrokeClass(value)} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference - progress} style={{ transition: "stroke-dashoffset 1s ease-out" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-foreground">{value.toFixed(1)}</span>
          <span className="text-[10px] text-muted-foreground">/10</span>
        </div>
      </div>
      <div>
        <p className={`text-lg font-bold ${getScoreTextClass(value)}`}>{rating}</p>
        <p className="text-xs text-muted-foreground">Overall Score</p>
      </div>
    </div>
  );
};

const CATEGORY_DETAILS: Record<keyof EvaluationScoresType, { emoji: string; description: string; factors: string[] }> = {
  solution: {
    emoji: "💡",
    description: "How well the proposed solution addresses the identified problem. A high score means the solution is targeted, innovative, and directly solves user pain points.",
    factors: ["Directness of problem-solution fit", "Innovation and uniqueness of approach", "User experience and simplicity", "Scalability of the solution"],
  },
  problem: {
    emoji: "🎯",
    description: "How significant, painful, and widespread the problem is. A high score means there's a large group of people actively seeking a solution.",
    factors: ["Severity of pain for affected users", "Frequency — how often users face this problem", "Size of the affected population", "Willingness to pay for a solution"],
  },
  features: {
    emoji: "⚡",
    description: "How compelling, differentiated, and well-designed the core features are. A high score means features provide clear value over alternatives.",
    factors: ["Feature differentiation from competitors", "Completeness of the feature set", "Technical feasibility", "User delight and engagement potential"],
  },
  market: {
    emoji: "📊",
    description: "The total addressable market size and growth trajectory. A high score indicates a large, growing market with strong tailwinds.",
    factors: ["Total Addressable Market (TAM) size", "Year-over-year market growth rate", "Favorable industry trends", "Regulatory environment"],
  },
  revenue: {
    emoji: "💰",
    description: "Clarity and scalability of the revenue model. A high score means there's a proven monetization strategy with strong unit economics.",
    factors: ["Pricing model clarity", "Customer willingness to pay", "Recurring revenue potential", "Path to profitability"],
  },
  competition: {
    emoji: "🏆",
    description: "How favorable the competitive landscape is. A high score means few direct competitors and strong defensibility through moats.",
    factors: ["Number and strength of competitors", "Barriers to entry for new players", "Defensibility and moat strength", "Switching costs for customers"],
  },
  risk: {
    emoji: "⚠️",
    description: "Overall risk assessment (inverted: 10 = very low risk). A low score means significant risks exist around execution, regulation, or market timing.",
    factors: ["Technical execution risk", "Regulatory and compliance risk", "Market timing risk", "Team and resource risk"],
  },
};

interface Props {
  scores: EvaluationScoresType;
}

const EvaluationScoresCard = ({ scores }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<keyof EvaluationScoresType | null>(null);

  const categories: { key: keyof EvaluationScoresType; label: string }[] = [
    { key: "solution", label: "Solution" },
    { key: "problem", label: "Problem" },
    { key: "features", label: "Features" },
    { key: "market", label: "Market" },
    { key: "revenue", label: "Revenue" },
    { key: "competition", label: "Competition" },
    { key: "risk", label: "Risk" },
  ];

  const values = categories.map((c) => scores[c.key]);
  const overall = values.reduce((a, b) => a + b, 0) / values.length;

  const handleCategoryClick = (key: keyof EvaluationScoresType) => {
    setSelectedCategory(key);
    setShowModal(true);
  };

  const getRatingLabel = (v: number) => (v >= 8 ? "Excellent" : v >= 6 ? "Good" : v >= 4 ? "Fair" : "Weak");

  return (
    <>
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Evaluation Scores</h2>
          </div>
          <button
            onClick={() => { setSelectedCategory(null); setShowModal(true); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>How it works</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <OverallRing value={overall} />
          <div className="w-px h-16 bg-border/60 hidden sm:block" />
          <div className="flex flex-wrap justify-center gap-5">
            {categories.map(({ key, label }) => (
              <ScoreRing key={key} value={scores[key]} label={label} onClick={() => handleCategoryClick(key)} />
            ))}
          </div>
        </div>
      </div>

      {/* Evaluation Details Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border/60 bg-card shadow-2xl p-6 animate-in fade-in-0 zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">
                {selectedCategory ? `${CATEGORY_DETAILS[selectedCategory].emoji} ${categories.find(c => c.key === selectedCategory)?.label} Score` : "How AI Calculates Scores"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedCategory ? (
              /* Single category detail view */
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <ScoreRing value={scores[selectedCategory]} label="" size={64} />
                  <div>
                    <p className={`text-lg font-bold ${getScoreTextClass(scores[selectedCategory])}`}>
                      {scores[selectedCategory]}/10 — {getRatingLabel(scores[selectedCategory])}
                    </p>
                    <p className="text-sm text-muted-foreground">{CATEGORY_DETAILS[selectedCategory].description}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Evaluation Factors</p>
                  <div className="space-y-2">
                    {CATEGORY_DETAILS[selectedCategory].factors.map((factor, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-secondary/30 p-3">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="text-sm text-muted-foreground">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-primary hover:underline"
                >
                  ← View all categories
                </button>
              </div>
            ) : (
              /* Overview of all categories */
              <div className="space-y-5">
                <div className="rounded-xl bg-secondary/50 border border-border/40 p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    The AI evaluates each startup idea across <strong className="text-foreground">7 dimensions</strong>, scoring each from 1–10. 
                    The overall score is the average of all individual scores. Each dimension is assessed based on specific factors like market size, competitive landscape, and technical feasibility.
                  </p>
                </div>

                <div className="space-y-2">
                  {categories.map(({ key, label }) => {
                    const detail = CATEGORY_DETAILS[key];
                    const value = scores[key];
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className="w-full flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 p-3 transition-all text-left"
                      >
                        <span className="text-lg">{detail.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground truncate">{detail.description.slice(0, 60)}…</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-sm font-bold ${getScoreTextClass(value)}`}>{value}/10</span>
                          <span className="text-muted-foreground text-xs">→</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="text-center pt-2">
                  <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Star className="w-3.5 h-3.5 text-primary" />
                    Overall: <span className={`font-bold ${getScoreTextClass(overall)}`}>{overall.toFixed(1)}/10</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default EvaluationScoresCard;
