import React from "react";
import { TrendingUp, Lightbulb, Target, BarChart3, DollarSign, Shield, AlertTriangle } from "lucide-react";
import { StartupBlueprint } from "@/types/startup";

interface Props {
  startup: StartupBlueprint;
}

const MarketAnalysis = ({ startup }: Props) => {
  const { investorPitch, pricingModel } = startup;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <h2 className="font-bold text-xl">Market Analysis</h2>
      </div>
      <div className="h-px bg-border/60 my-5" />

      {/* Solution Overview */}
      <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-primary">Solution Overview</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{investorPitch.solution}</p>
      </div>

      {/* Problem Statement */}
      <div className="rounded-xl border border-border/60 bg-card p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-foreground" />
          <h3 className="font-semibold">Problem Statement</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{investorPitch.problemStatement}</p>
      </div>

      {/* 2x2 Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Market Snapshot */}
        <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-blue-400">Market Snapshot</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{investorPitch.marketSize}</p>
        </div>

        {/* Monetization */}
        <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-amber-600">Monetization</h3>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{pricingModel.type}</p>
          <ul className="space-y-1.5">
            {pricingModel.tiers.map((t, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                <span>
                  <span className="font-medium text-foreground">{t.name}:</span> {t.price}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Competitive Edge */}
        <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-primary">Competitive Edge</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{investorPitch.uniqueAdvantage}</p>
        </div>

        {/* Risk Factors */}
        <div className="rounded-xl bg-destructive/5 border border-destructive/10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold text-destructive">Risk Factors</h3>
          </div>
          <ul className="space-y-1.5">
            {startup.targetPersona.painPoints.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-1.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysis;
