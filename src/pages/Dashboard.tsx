import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import MetricsDashboard from "@/components/MetricsDashboard";
import Leaderboard from "@/components/Leaderboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, Trophy } from "lucide-react";

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

const Dashboard = () => {
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("generation_metrics").select("*").order("created_at", { ascending: false }).limit(100);
      if (!error && data) setMetrics(data as MetricRow[]);
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="metrics">
          <TabsList className="mb-8 bg-secondary/50 p-1 rounded-xl">
            <TabsTrigger value="metrics" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BarChart3 className="w-4 h-4" /> Metrics
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Trophy className="w-4 h-4" /> Leaderboard
            </TabsTrigger>
          </TabsList>
          <TabsContent value="metrics">
            <MetricsDashboard metrics={metrics} loading={loading} />
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard metrics={metrics} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
