// Startup blueprint types
export interface TargetPersona {
  name: string;
  age: string;
  painPoints: string[];
  goals: string[];
}

export interface CoreFeature {
  name: string;
  description: string;
  icon: string;
}

export interface PricingTier {
  name: string;
  price: string;
  features: string[];
}

export interface PricingModel {
  type: string;
  tiers: PricingTier[];
}

export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  ai: string[];
  devops: string[];
  infrastructure: string[];
  apis: string[];
  observability: string[];
}

export interface RoadmapPhase {
  week: string;
  phase: string;
  tasks: string[];
}

export interface InvestorPitch {
  problemStatement: string;
  solution: string;
  marketSize: string;
  traction: string;
  ask: string;
  uniqueAdvantage: string;
}

export interface EvaluationScores {
  solution: number;
  problem: number;
  features: number;
  market: number;
  revenue: number;
  competition: number;
  risk: number;
}

export interface StartupBlueprint {
  name: string;
  tagline: string;
  category: string;
  targetPersona: TargetPersona;
  coreFeatures: CoreFeature[];
  pricingModel: PricingModel;
  techStack: TechStack;
  launchRoadmap: RoadmapPhase[];
  investorPitch: InvestorPitch;
  confidenceScore: number;
  evaluationScores?: EvaluationScores;
}

export interface GenerationMetrics {
  generationTimeMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  outputLength: number;
}
