import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, CartesianGrid, AreaChart, Area
} from "recharts";
import { Clock, Coins, FileText, Star, TrendingUp, Zap, Hash, CalendarDays } from "lucide-react";

interface MetricRow {
  id: string;
  created_at: string;
  idea: string;
  startup_name: string;
  category: string;
  generation_time_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  output_length: number;
  confidence_score: number;
}

interface Props {
  metrics: MetricRow[];
  loading: boolean;
}

const COLORS = [
  "hsl(258 90% 66%)",
  "hsl(200 90% 60%)",
  "hsl(290 80% 60%)",
  "hsl(160 70% 50%)",
  "hsl(40 90% 60%)",
  "hsl(0 80% 60%)",
  "hsl(320 80% 55%)",
  "hsl(180 70% 50%)",
];

const StatCard = ({
  label, value, sub, icon: Icon, trend
}: { label: string; value: string; sub?: string; icon: React.ComponentType<{ className?: string }>; trend?: string }) => (
  <div className="rounded-2xl border border-border/60 bg-card p-6">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" />
      </div>
    </div>
    <div className="text-3xl font-black gradient-text">{value}</div>
    <div className="flex items-center gap-2 mt-1">
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      {trend && <span className="text-xs text-primary font-medium">{trend}</span>}
    </div>
  </div>
);

const MetricsDashboard = ({ metrics, loading }: Props) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading metrics...
        </div>
      </div>
    );
  }

  if (metrics.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Zap className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">No metrics yet</h2>
        <p className="text-muted-foreground">Generate your first startup to see the dashboard fill up.</p>
      </div>
    );
  }

  // Real aggregations
  const totalGenerations = metrics.length;
  const avgGenTime = Math.round(metrics.reduce((a, m) => a + (m.generation_time_ms || 0), 0) / totalGenerations);
  const avgTokens = Math.round(metrics.reduce((a, m) => a + (m.total_tokens || 0), 0) / totalGenerations);
  const avgConfidence = Math.round(metrics.reduce((a, m) => a + (m.confidence_score || 0), 0) / totalGenerations);
  const totalTokens = metrics.reduce((a, m) => a + (m.total_tokens || 0), 0);
  const totalPromptTokens = metrics.reduce((a, m) => a + (m.prompt_tokens || 0), 0);
  const totalCompletionTokens = metrics.reduce((a, m) => a + (m.completion_tokens || 0), 0);
  const avgOutputLen = Math.round(metrics.reduce((a, m) => a + (m.output_length || 0), 0) / totalGenerations);
  const fastestGen = Math.min(...metrics.map(m => m.generation_time_ms || Infinity));
  const slowestGen = Math.max(...metrics.map(m => m.generation_time_ms || 0));
  const highestConfidence = Math.max(...metrics.map(m => m.confidence_score || 0));
  const lowestConfidence = Math.min(...metrics.map(m => m.confidence_score || Infinity));

  // Category frequency
  const categoryCount: Record<string, number> = {};
  metrics.forEach((m) => {
    if (m.category) categoryCount[m.category] = (categoryCount[m.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name: name.length > 16 ? name.slice(0, 16) + "…" : name, value }));

  // Timeline data (all, reversed to chronological)
  const timelineData = [...metrics]
    .reverse()
    .map((m, i) => ({
      index: i + 1,
      name: m.startup_name || `#${i + 1}`,
      time: +((m.generation_time_ms || 0) / 1000).toFixed(2),
      tokens: m.total_tokens || 0,
      promptTokens: m.prompt_tokens || 0,
      completionTokens: m.completion_tokens || 0,
      confidence: m.confidence_score || 0,
      outputLen: m.output_length || 0,
    }));

  // Real token distribution
  const pieData = [
    { name: "Prompt Tokens", value: totalPromptTokens },
    { name: "Completion Tokens", value: totalCompletionTokens },
  ];

  // Confidence distribution buckets
  const confidenceBuckets = [
    { range: "0-40", count: metrics.filter(m => m.confidence_score <= 40).length },
    { range: "41-60", count: metrics.filter(m => m.confidence_score > 40 && m.confidence_score <= 60).length },
    { range: "61-80", count: metrics.filter(m => m.confidence_score > 60 && m.confidence_score <= 80).length },
    { range: "81-100", count: metrics.filter(m => m.confidence_score > 80).length },
  ];

  // Daily generation count
  const dailyCount: Record<string, number> = {};
  metrics.forEach(m => {
    const day = new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    dailyCount[day] = (dailyCount[day] || 0) + 1;
  });
  const dailyData = Object.entries(dailyCount).reverse().map(([day, count]) => ({ day, count }));

  const customTooltipStyle = {
    backgroundColor: "hsl(240 10% 6%)",
    border: "1px solid hsl(240 8% 14%)",
    borderRadius: "12px",
    color: "hsl(0 0% 98%)",
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-3xl font-black">AI Product Generation Metrics</h1>
        </div>
        <p className="text-muted-foreground">Real-time observability — all data from actual generations</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Generations" value={String(totalGenerations)} icon={Zap} sub={`${totalTokens.toLocaleString()} total tokens`} />
        <StatCard
          label="Avg Generation Time"
          value={`${(avgGenTime / 1000).toFixed(1)}s`}
          sub={`Range: ${(fastestGen / 1000).toFixed(1)}s – ${(slowestGen / 1000).toFixed(1)}s`}
          icon={Clock}
        />
        <StatCard
          label="Avg Token Usage"
          value={avgTokens.toLocaleString()}
          sub={`~${avgOutputLen.toLocaleString()} chars output`}
          icon={Coins}
        />
        <StatCard
          label="Avg Confidence Score"
          value={`${avgConfidence}/100`}
          sub={`Range: ${lowestConfidence} – ${highestConfidence}`}
          icon={Star}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Generation time over time */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-bold mb-1">Generation Time (seconds)</h3>
          <p className="text-xs text-muted-foreground mb-4">Per generation, chronological order</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="timeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(258 90% 66%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(258 90% 66%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 14%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(240 5% 55%)", fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} unit="s" />
              <Tooltip contentStyle={customTooltipStyle} formatter={(v: number) => [`${v}s`, "Time"]} />
              <Area type="monotone" dataKey="time" stroke="hsl(258 90% 66%)" strokeWidth={2} fill="url(#timeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Token usage stacked */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-bold mb-1">Token Usage Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Prompt vs completion tokens per generation</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 14%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(240 5% 55%)", fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="promptTokens" stackId="tokens" fill="hsl(258 90% 66%)" name="Prompt" radius={[0, 0, 0, 0]} />
              <Bar dataKey="completionTokens" stackId="tokens" fill="hsl(200 90% 60%)" name="Completion" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Category Frequency */}
        <div className="lg:col-span-1 rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-bold mb-1">Category Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">{Object.keys(categoryCount).length} unique categories</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 14%)" />
              <XAxis type="number" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence score over time */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-bold mb-1">Confidence Scores</h3>
          <p className="text-xs text-muted-foreground mb-4">Per generation</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 14%)" />
              <XAxis dataKey="name" tick={{ fill: "hsl(240 5% 55%)", fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Line type="monotone" dataKey="confidence" stroke="hsl(160 70% 50%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(160 70% 50%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Token distribution pie - REAL DATA */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-bold mb-1">Token Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">Actual prompt vs completion</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={customTooltipStyle} formatter={(v: number) => [v.toLocaleString(), "Tokens"]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                {d.name} ({d.value.toLocaleString()})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Confidence distribution */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <h3 className="font-bold mb-1">Confidence Score Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">How scores are distributed</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={confidenceBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 14%)" />
              <XAxis dataKey="range" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="count" fill="hsl(160 70% 50%)" radius={[4, 4, 0, 0]} name="Startups" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Daily generation count */}
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-primary" />
            <h3 className="font-bold">Generations Per Day</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Activity over time</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 8% 14%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(240 5% 55%)", fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="count" fill="hsl(290 80% 60%)" radius={[4, 4, 0, 0]} name="Generations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Generations Table */}
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="font-bold">Recent Generations</h3>
          <span className="text-xs text-muted-foreground ml-auto">{totalGenerations} total</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                {["Startup", "Idea", "Category", "Time", "Prompt", "Completion", "Total", "Score"].map((h) => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.slice(0, 15).map((m) => (
                <tr key={m.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-3 font-medium">{m.startup_name || "—"}</td>
                  <td className="py-3 px-3 text-muted-foreground max-w-[180px] truncate">{m.idea}</td>
                  <td className="py-3 px-3">
                    {m.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20">
                        {m.category}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground">{((m.generation_time_ms || 0) / 1000).toFixed(1)}s</td>
                  <td className="py-3 px-3 text-muted-foreground">{(m.prompt_tokens || 0).toLocaleString()}</td>
                  <td className="py-3 px-3 text-muted-foreground">{(m.completion_tokens || 0).toLocaleString()}</td>
                  <td className="py-3 px-3 text-muted-foreground font-medium">{(m.total_tokens || 0).toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${(m.confidence_score || 0) >= 80 ? "text-green-400" : (m.confidence_score || 0) >= 60 ? "text-yellow-400" : "text-destructive"}`}>
                      {m.confidence_score}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
