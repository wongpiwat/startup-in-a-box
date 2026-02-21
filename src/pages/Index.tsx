import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { StartupBlueprint, GenerationMetrics } from "@/types/startup";
import GeneratorInput from "@/components/GeneratorInput";
import StartupResult from "@/components/StartupResult";
import NavBar from "@/components/NavBar";

const Index = () => {
  const location = useLocation();
  const [startup, setStartup] = useState<StartupBlueprint | null>(null);
  const [metrics, setMetrics] = useState<GenerationMetrics | null>(null);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const state = location.state as { startup?: StartupBlueprint; id?: string } | null;
    if (state?.startup) {
      setStartup(state.startup);
      setStartupId(state.id ?? null);
      setMetrics(null);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      {!startup ? (
        <GeneratorInput
          onResult={(s, m, id) => {
            setStartup(s);
            setMetrics(m);
            setStartupId(id ?? null);
          }}
          loading={loading}
          setLoading={setLoading}
        />
      ) : (
        <StartupResult
          startup={startup}
          metrics={metrics}
          onReset={() => { setStartup(null); setMetrics(null); setStartupId(null); }}
          startupId={startupId}
        />
      )}
    </div>
  );
};

export default Index;
