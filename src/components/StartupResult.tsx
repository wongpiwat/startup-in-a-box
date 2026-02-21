import React, { useState } from "react";
import { StartupBlueprint, GenerationMetrics } from "@/types/startup";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Star, Zap, Users, LayoutGrid, DollarSign, Code2, Map, TrendingUp, Clock, Coins, Share2, Copy, Download, RefreshCw, ExternalLink, Info, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import EvaluationScoresCard from "@/components/EvaluationScores";
import CompetitionSection from "@/components/CompetitionSection";
import MarketAnalysis from "@/components/MarketAnalysis";
import { getPlaceholderEmoji } from "@/lib/placeholder-emoji";

const TECH_INFO: Record<string, { desc: string; url: string }> = {
  React: { desc: "Popular UI library for building interactive web interfaces", url: "https://react.dev" },
  "Next.js": { desc: "Full-stack React framework with SSR and API routes", url: "https://nextjs.org" },
  "Vue.js": { desc: "Progressive JavaScript framework for building UIs", url: "https://vuejs.org" },
  Angular: { desc: "Platform for building mobile and desktop web apps", url: "https://angular.dev" },
  Svelte: { desc: "Compiler-based framework with minimal runtime overhead", url: "https://svelte.dev" },
  TypeScript: { desc: "Typed superset of JavaScript for safer code", url: "https://typescriptlang.org" },
  "Tailwind CSS": { desc: "Utility-first CSS framework for rapid UI development", url: "https://tailwindcss.com" },
  "Node.js": { desc: "JavaScript runtime for server-side applications", url: "https://nodejs.org" },
  Express: { desc: "Minimal and flexible Node.js web application framework", url: "https://expressjs.com" },
  FastAPI: { desc: "High-performance Python web framework for APIs", url: "https://fastapi.tiangolo.com" },
  Django: { desc: "High-level Python web framework with batteries included", url: "https://djangoproject.com" },
  Flask: { desc: "Lightweight Python web framework for small to medium apps", url: "https://flask.palletsprojects.com" },
  PostgreSQL: { desc: "Advanced open-source relational database", url: "https://postgresql.org" },
  MongoDB: { desc: "NoSQL document database for flexible data models", url: "https://mongodb.com" },
  Redis: { desc: "In-memory data store for caching and real-time apps", url: "https://redis.io" },
  Supabase: { desc: "Open-source Firebase alternative with Postgres", url: "https://supabase.com" },
  Firebase: { desc: "Google's platform for building mobile and web apps", url: "https://firebase.google.com" },
  AWS: { desc: "Amazon's comprehensive cloud computing platform", url: "https://aws.amazon.com" },
  "Amazon Bedrock": { desc: "Fully managed service for foundation models on AWS", url: "https://aws.amazon.com/bedrock" },
  "Google Cloud": { desc: "Google's suite of cloud computing services", url: "https://cloud.google.com" },
  Vercel: { desc: "Platform for frontend frameworks and static sites", url: "https://vercel.com" },
  Docker: { desc: "Container platform for consistent dev and deployment", url: "https://docker.com" },
  Kubernetes: { desc: "Container orchestration for automated deployment", url: "https://kubernetes.io" },
  Terraform: { desc: "Infrastructure as code for cloud resource management", url: "https://terraform.io" },
  Datadog: { desc: "Monitoring and analytics platform for cloud apps", url: "https://datadoghq.com" },
  Grafana: { desc: "Open-source analytics and monitoring visualization", url: "https://grafana.com" },
  Stripe: { desc: "Payment processing platform for online businesses", url: "https://stripe.com" },
  OpenAI: { desc: "AI research lab providing GPT models and APIs", url: "https://openai.com" },
  TensorFlow: { desc: "Open-source ML framework by Google", url: "https://tensorflow.org" },
  PyTorch: { desc: "Deep learning framework with dynamic computation", url: "https://pytorch.org" },
  LangChain: { desc: "Framework for building LLM-powered applications", url: "https://langchain.com" },
  Pinecone: { desc: "Vector database for similarity search and AI apps", url: "https://pinecone.io" },
  Elasticsearch: { desc: "Distributed search and analytics engine", url: "https://elastic.co" },
  GraphQL: { desc: "Query language for APIs with flexible data fetching", url: "https://graphql.org" },
  Prisma: { desc: "Next-generation ORM for Node.js and TypeScript", url: "https://prisma.io" },
  "GitHub Actions": { desc: "CI/CD automation built into GitHub", url: "https://github.com/features/actions" },
  Jenkins: { desc: "Open-source automation server for CI/CD", url: "https://jenkins.io" },
  Sentry: { desc: "Error tracking and performance monitoring platform", url: "https://sentry.io" },
  Twilio: { desc: "Cloud communications platform for SMS, voice, video", url: "https://twilio.com" },
  SendGrid: { desc: "Cloud-based email delivery and management service", url: "https://sendgrid.com" },
  Kafka: { desc: "Distributed event streaming platform", url: "https://kafka.apache.org" },
  RabbitMQ: { desc: "Open-source message broker for async communication", url: "https://rabbitmq.com" },
  Go: { desc: "Fast, statically typed language by Google", url: "https://go.dev" },
  Rust: { desc: "Systems language focused on safety and performance", url: "https://rust-lang.org" },
  Python: { desc: "Versatile high-level programming language", url: "https://python.org" },
  "React Native": { desc: "Build native mobile apps using React", url: "https://reactnative.dev" },
  Flutter: { desc: "Google's UI toolkit for cross-platform apps", url: "https://flutter.dev" },
  Swift: { desc: "Apple's programming language for iOS/macOS apps", url: "https://swift.org" },
  Kotlin: { desc: "Modern language for Android and server-side dev", url: "https://kotlinlang.org" },
};

const TechChip = ({ tech }: { tech: string }) => {
  const [open, setOpen] = useState(false);
  const info = TECH_INFO[tech];

  return (
    <div className="relative" onMouseEnter={() => info && setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className={`inline-block px-3 py-1 rounded-full border text-sm font-medium transition-all ${info ? "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 cursor-pointer" : "bg-primary/10 border-primary/20 text-primary"}`}>
        {tech}
      </span>
      {open && info && (
        <div className="absolute z-50 top-full mt-2 left-0 w-64 rounded-xl border border-border/60 bg-card shadow-xl p-4 animate-in fade-in-0 zoom-in-95 pointer-events-auto">
          <p className="font-semibold text-sm mb-1">{tech}</p>
          <p className="text-xs text-muted-foreground mb-3">{info.desc}</p>
          <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            Learn more <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};

interface Props {
  startup: StartupBlueprint;
  metrics: GenerationMetrics | null;
  onReset: () => void;
  startupId?: string | null;
}

const Badge = ({ children }: { children: React.ReactNode }) => <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary border border-primary/20">{children}</span>;

const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => <div className={`rounded-2xl border border-border/60 bg-card p-6 ${className}`}>{children}</div>;

const RegenerateBtn = ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
  <button onClick={onClick} disabled={loading} title="Regenerate this section" className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors disabled:opacity-40">
    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
  </button>
);

const StartupResult = ({ startup: initialStartup, metrics, onReset, startupId }: Props) => {
  const [startup, setStartup] = useState<StartupBlueprint>(initialStartup);
  const [activeTab, setActiveTab] = useState("overview");
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const shareUrl = startupId ? `${window.location.origin}/startup/${startupId}` : null;

  const handleShare = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Shareable link copied!");
    } else {
      toast.error("Save the startup first to get a shareable link.");
    }
  };

  const handleSteal = () => {
    const prompt = `Build me an MVP for ${startup.name} — ${startup.tagline}. It's a ${startup.category} startup targeting ${startup.targetPersona.name}. Core features: ${startup.coreFeatures
      .slice(0, 3)
      .map((f) => f.name)
      .join(", ")}.`;
    navigator.clipboard.writeText(prompt);
    toast.success("Prompt copied! Paste it into any AI tool 🚀");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const fillPageBg = () => {
      doc.setFillColor(15, 15, 25);
      doc.rect(0, 0, pageW, pageH, "F");
    };

    fillPageBg();

    const newPageIfNeeded = (needed: number) => {
      if (y + needed > pageH - margin) {
        doc.addPage();
        fillPageBg();
        y = margin;
      }
    };

    const addText = (text: string, size: number, bold = false, color: [number, number, number] = [240, 240, 240]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setTextColor(...color);
      // Strip emojis that jsPDF can't render
      const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, "").trim();
      const lines = doc.splitTextToSize(clean, contentW);
      lines.forEach((line: string) => {
        newPageIfNeeded(size * 0.45 + 1);
        doc.text(line, margin, y);
        y += size * 0.45;
      });
      y += 3;
    };

    const addSection = (title: string) => {
      y += 4;
      newPageIfNeeded(16);
      doc.setFillColor(80, 40, 160);
      doc.roundedRect(margin, y - 5, contentW, 10, 2, 2, "F");
      addText(title, 11, true, [255, 255, 255]);
      y += 2;
    };

    const addSubheading = (title: string, color: [number, number, number] = [160, 100, 255]) => {
      newPageIfNeeded(10);
      addText(title, 10, true, color);
    };

    // ── Title ──
    addText(startup.name, 28, true, [160, 100, 255]);
    addText(startup.tagline, 13, false, [180, 180, 200]);
    addText(`${startup.category}  |  Score: ${startup.confidenceScore}/100`, 10, false, [120, 120, 150]);
    if (startup.evaluationScores) {
      const s = startup.evaluationScores;
      addText(`Solution: ${s.solution}  Problem: ${s.problem}  Features: ${s.features}  Market: ${s.market}  Revenue: ${s.revenue}  Competition: ${s.competition}  Risk: ${s.risk}`, 9, false, [140, 140, 160]);
    }
    y += 5;

    // ── Market Analysis ──
    addSection("Market Analysis");
    addSubheading("Solution Overview");
    addText(startup.investorPitch.solution, 9);
    addSubheading("Problem Statement");
    addText(startup.investorPitch.problemStatement, 9);
    addSubheading("Market Size", [100, 150, 255]);
    addText(startup.investorPitch.marketSize, 9);
    addSubheading("Competitive Edge");
    addText(startup.investorPitch.uniqueAdvantage, 9);

    // ── Target Persona ──
    addSection("Target Persona");
    addText(`${startup.targetPersona.name} (${startup.targetPersona.age})`, 11, true);
    addText("Pain Points: " + startup.targetPersona.painPoints.join(" | "), 9);
    addText("Goals: " + startup.targetPersona.goals.join(" | "), 9);

    // ── Core Features ──
    addSection("Core Features");
    startup.coreFeatures.forEach((f) => addText(`${f.name}: ${f.description}`, 9));

    // ── Pricing Model ──
    addSection("Pricing Model");
    addText(`Model: ${startup.pricingModel.type}`, 10);
    startup.pricingModel.tiers.forEach((t) => addText(`${t.name} — ${t.price}: ${t.features.join(", ")}`, 9));

    // ── Tech Stack ──
    addSection("Tech Stack");
    Object.entries(startup.techStack).forEach(([layer, techs]) => addText(`${layer.toUpperCase()}: ${(techs as string[]).join(", ")}`, 9));

    // ── Launch Roadmap ──
    addSection("Launch Roadmap");
    startup.launchRoadmap.forEach((p) => addText(`${p.week} — ${p.phase}: ${p.tasks.join(" | ")}`, 9));

    // ── Investor Pitch ──
    addSection("Investor Pitch");
    addText(`Problem: ${startup.investorPitch.problemStatement}`, 9);
    addText(`Solution: ${startup.investorPitch.solution}`, 9);
    addText(`Market: ${startup.investorPitch.marketSize}`, 9);
    addText(`Traction: ${startup.investorPitch.traction}`, 9);
    addText(`Ask: ${startup.investorPitch.ask}`, 9);
    addText(`Moat: ${startup.investorPitch.uniqueAdvantage}`, 9);

    doc.save(`${startup.name.replace(/\s+/g, "_")}_pitch_deck.pdf`);
    toast.success("PDF exported!");
  };

  const handleRegenerateSection = async (section: string) => {
    setRegenerating(section);
    try {
      const { data, error } = await supabase.functions.invoke("regenerate-section", {
        body: { idea: startup.tagline, startupName: startup.name, section },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setStartup((prev) => ({ ...prev, ...data.sectionData }));
      setHasUnsavedChanges(true);
      toast.success("Section regenerated! Click Save to keep changes.");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegenerating(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!startupId) {
      toast.error("No saved startup to update.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("generation_metrics")
        .update({ result_json: startup as any })
        .eq("id", startupId);
      if (error) throw error;
      setHasUnsavedChanges(false);
      toast.success("Changes saved!");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <Button variant="ghost" onClick={onReset} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          New Idea
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          {metrics && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground mr-2">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {(metrics.generationTimeMs / 1000).toFixed(1)}s
              </span>
              <span className="flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {metrics.totalTokens.toLocaleString()} tokens
              </span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs border-border/60 hover:border-primary/40">
            <Share2 className="w-3.5 h-3.5" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={handleSteal} className="gap-1.5 text-xs border-border/60 hover:border-primary/40">
            <Copy className="w-3.5 h-3.5" /> Steal Idea
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1.5 text-xs border-border/60 hover:border-primary/40">
            <Download className="w-3.5 h-3.5" /> Export PDF
          </Button>
          {hasUnsavedChanges && (
            <Button size="sm" onClick={handleSaveChanges} disabled={saving} className="gap-1.5 text-xs">
              {saving ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className="relative rounded-3xl overflow-hidden border border-border/60 bg-card mb-8 p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Logo placeholder (random emoji by startup name) */}
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-4xl shrink-0">
            {getPlaceholderEmoji(startup.name)}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-4xl font-black gradient-text">{startup.name}</h1>
              <Badge>{startup.category}</Badge>
            </div>
            <p className="text-xl text-muted-foreground">{startup.tagline}</p>
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="text-5xl font-black gradient-text">{startup.confidenceScore}</div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-primary" />
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full mb-8 bg-secondary/50 p-1 rounded-xl h-auto">
          {[
            { id: "overview", label: "Overview", icon: LayoutGrid },
            { id: "product", label: "Product", icon: Zap },
            { id: "tech", label: "Tech Stack", icon: Code2 },
            { id: "pitch", label: "Investor Pitch", icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <TabsTrigger key={id} value={id} className="flex items-center gap-2 text-sm py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6">
          {startup.evaluationScores && <EvaluationScoresCard scores={startup.evaluationScores} />}
          <MarketAnalysis startup={startup} />
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-lg">Target Persona</h2>
                </div>
                <RegenerateBtn loading={regenerating === "targetPersona"} onClick={() => handleRegenerateSection("targetPersona")} />
              </div>
              <div className="mb-4">
                <p className="font-semibold text-foreground">{startup.targetPersona.name}</p>
                <p className="text-sm text-muted-foreground">{startup.targetPersona.age}</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pain Points</p>
                  <ul className="space-y-1.5">
                    {startup.targetPersona.painPoints.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-destructive mt-0.5 leading-none">✕</span>
                        <span className="text-muted-foreground">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Goals</p>
                  <ul className="space-y-1.5">
                    {startup.targetPersona.goals.map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-accent mt-0.5 leading-none">✓</span>
                        <span className="text-muted-foreground">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h2 className="font-bold text-lg">Pricing Model</h2>
                  <Badge>{startup.pricingModel.type}</Badge>
                </div>
                <RegenerateBtn loading={regenerating === "pricingModel"} onClick={() => handleRegenerateSection("pricingModel")} />
              </div>
              <div className="space-y-3">
                {startup.pricingModel.tiers.map((tier, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${i === 1 ? "border-primary/40 bg-primary/5" : "border-border/60 bg-secondary/30"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{tier.name}</span>
                      <span className={`font-bold ${i === 1 ? "text-primary" : "text-foreground"}`}>{tier.price}</span>
                    </div>
                    <ul className="space-y-1">
                      {tier.features.map((f, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <CompetitionSection idea={startup.tagline} startupName={startup.name} category={startup.category} startupId={startupId ?? undefined} />
        </TabsContent>

        {/* PRODUCT */}
        <TabsContent value="product" className="space-y-6">
          <SectionCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Core Features</h2>
              </div>
              <RegenerateBtn loading={regenerating === "coreFeatures"} onClick={() => handleRegenerateSection("coreFeatures")} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {startup.coreFeatures.map((feat, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-secondary/30 p-4 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <div className="text-3xl mb-3">{feat.icon}</div>
                  <h3 className="font-semibold mb-2">{feat.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Launch Roadmap</h2>
              </div>
              <RegenerateBtn loading={regenerating === "launchRoadmap"} onClick={() => handleRegenerateSection("launchRoadmap")} />
            </div>
            <div className="relative">
              <div className="absolute left-[1.65rem] top-0 bottom-0 w-px bg-border/60" />
              <div className="space-y-6">
                {startup.launchRoadmap.map((phase, i) => (
                  <div key={i} className="relative flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary shrink-0 z-10">{i + 1}</div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">{phase.phase}</span>
                        <Badge>{phase.week}</Badge>
                      </div>
                      <ul className="space-y-1">
                        {phase.tasks.map((t, j) => (
                          <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* TECH */}
        <TabsContent value="tech" className="space-y-6">
          <SectionCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Tech Stack</h2>
              </div>
              <RegenerateBtn loading={regenerating === "techStack"} onClick={() => handleRegenerateSection("techStack")} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(startup.techStack).map(([layer, techs]) => (
                <div key={layer} className="rounded-xl border border-border/60 bg-secondary/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{layer}</p>
                  <div className="flex flex-wrap gap-2">
                    {(techs as string[]).map((tech, i) => (
                      <TechChip key={i} tech={tech} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        {/* PITCH */}
        <TabsContent value="pitch" className="space-y-6">
          <SectionCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Investor Pitch</h2>
              </div>
              <RegenerateBtn loading={regenerating === "investorPitch"} onClick={() => handleRegenerateSection("investorPitch")} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "The Problem", content: startup.investorPitch.problemStatement, color: "text-destructive" },
                { label: "Our Solution", content: startup.investorPitch.solution, color: "text-primary" },
                { label: "Market Size", content: startup.investorPitch.marketSize, color: "text-blue-400" },
                { label: "Early Traction", content: startup.investorPitch.traction, color: "text-yellow-400" },
                { label: "The Ask", content: startup.investorPitch.ask, color: "text-accent" },
                { label: "Unique Advantage", content: startup.investorPitch.uniqueAdvantage, color: "text-purple-400" },
              ].map(({ label, content, color }) => (
                <div key={label} className="rounded-xl border border-border/60 bg-secondary/30 p-5">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${color}`}>{label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Score modal removed — evaluation scores are now inline */}
    </div>
  );
};

export default StartupResult;
