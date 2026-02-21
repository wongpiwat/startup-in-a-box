import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NavBar from "@/components/NavBar";
import StartupResult from "@/components/StartupResult";
import StartupComments from "@/components/StartupComments";
import { StartupBlueprint } from "@/types/startup";
import { Sparkles } from "lucide-react";

const StartupPage = () => {
  const { id } = useParams<{ id: string }>();
  const [startup, setStartup] = useState<StartupBlueprint | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from("generation_metrics").select("result_json, logo_url").eq("id", id).single();
      if (error || !data?.result_json) {
        setNotFound(true);
      } else {
        setStartup(data.result_json as StartupBlueprint);
        if (data.logo_url) setLogoUrl(data.logo_url);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="inline-flex items-center gap-3 text-muted-foreground">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Loading startup...
          </div>
        </div>
      </div>
    );

  if (notFound || !startup)
    return (
      <div className="min-h-screen bg-background">
        <NavBar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Sparkles className="w-16 h-16 text-muted-foreground/30" />
          <h1 className="text-2xl font-bold">Startup not found</h1>
          <p className="text-muted-foreground">This link may be invalid or the startup was deleted.</p>
          <Link to="/" className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Generate a Startup
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      {/* Shared badge */}
      <div className="max-w-6xl mx-auto px-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-2">
          <Sparkles className="w-3 h-3" />
          Shared startup blueprint
        </div>
      </div>
      <StartupResult startup={startup} metrics={null} onReset={() => (window.location.href = "/")} startupId={id} />
      {id && <StartupComments startupId={id} />}
    </div>
  );
};

export default StartupPage;
