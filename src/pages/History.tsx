import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import NavBar from "@/components/NavBar";
import { Clock, Coins, Star, Search, ChevronRight, Sparkles, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface HistoryRow {
  id: string;
  created_at: string;
  idea: string;
  startup_name: string | null;
  category: string | null;
  generation_time_ms: number | null;
  total_tokens: number | null;
  confidence_score: number | null;
  is_favorite: boolean;
  result_json: unknown;
  record_type: string | null;
}

const History = () => {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("generation_metrics")
        .select("id, created_at, idea, startup_name, category, generation_time_ms, total_tokens, confidence_score, is_favorite, result_json, record_type")
        .neq("record_type", "battle")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!error && data) setRows(data as HistoryRow[]);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const filtered = rows.filter((r) => {
    if (showFavoritesOnly && !r.is_favorite) return false;
    if (!search) return true;
    return (
      r.idea.toLowerCase().includes(search.toLowerCase()) ||
      (r.startup_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (r.category ?? "").toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleClick = (row: HistoryRow) => {
    if (!row.result_json) return;
    navigate("/", { state: { startup: row.result_json, id: row.id } });
  };

  const handleToggleFavorite = async (e: React.MouseEvent, row: HistoryRow) => {
    e.stopPropagation();
    const newVal = !row.is_favorite;
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, is_favorite: newVal } : r));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("generation_metrics")
      .update({ is_favorite: newVal })
      .eq("id", row.id);
    if (error) {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, is_favorite: !newVal } : r));
      toast.error("Failed to update favorite");
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmId(id);
  };

  const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    setConfirmId(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("generation_metrics").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete — please try again.");
    } else {
      setRows(prev => prev.filter(r => r.id !== id));
      toast.success("Deleted successfully.");
    }
    setDeletingId(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const favCount = rows.filter(r => r.is_favorite).length;

  return (
    <div className="min-h-screen bg-background">
      <NavBar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">History</h1>
          <p className="text-muted-foreground">All your generated startups</p>
        </div>

        {/* Search + Favorites filter */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by idea, name, or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border/60"
            />
          </div>
          <button
            onClick={() => setShowFavoritesOnly(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              showFavoritesOnly
                ? "bg-primary/20 border-primary/40 text-primary"
                : "bg-card border-border/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
            Favorites {favCount > 0 && <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">{favCount}</span>}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading history...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">
              {showFavoritesOnly ? "No favorites yet" : search ? "No results found" : "No history yet"}
            </h2>
            <p className="text-muted-foreground">
              {showFavoritesOnly ? "Star any startup to save it here." : search ? "Try a different search term." : "Generate your first startup to see it here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <div
                key={row.id}
                className={`group relative rounded-2xl border bg-card transition-all ${
                  deletingId === row.id ? "opacity-40 scale-95" : ""
                } ${
                  confirmId === row.id
                    ? "border-destructive/60 bg-destructive/5"
                    : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                }`}
              >
                <button
                  onClick={() => handleClick(row)}
                  disabled={!row.result_json || deletingId === row.id}
                  className="w-full text-left p-5 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-primary/10 border border-primary/20">
                      🚀
                    </div>
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        {row.startup_name && <span className="font-bold text-foreground truncate">{row.startup_name}</span>}
                        {row.category && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 shrink-0">
                            {row.category}
                          </span>
                        )}
                        {row.is_favorite && <Star className="w-3.5 h-3.5 fill-current text-primary shrink-0" />}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{row.idea}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(row.created_at)}</span>
                        {row.generation_time_ms && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{(row.generation_time_ms / 1000).toFixed(1)}s</span>}
                        {row.total_tokens && <span className="flex items-center gap-1"><Coins className="w-3 h-3" />{row.total_tokens.toLocaleString()} tokens</span>}
                        {row.confidence_score != null && <span className="flex items-center gap-1"><Star className="w-3 h-3" />{row.confidence_score}/100</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </button>

                {/* Action buttons */}
                <div className={`absolute top-4 right-14 flex items-center gap-2 transition-opacity ${confirmId === row.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                  <button
                    onClick={(e) => handleToggleFavorite(e, row)}
                    className={`p-2 rounded-lg transition-colors ${row.is_favorite ? "text-primary" : "text-muted-foreground hover:text-primary"} hover:bg-primary/10`}
                    title={row.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={`w-4 h-4 ${row.is_favorite ? "fill-current" : ""}`} />
                  </button>

                  {confirmId === row.id ? (
                    <>
                      <span className="text-xs text-destructive font-medium mr-1">Delete?</span>
                      <button onClick={(e) => handleConfirmDelete(e, row.id)} className="px-3 py-1 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:bg-destructive/80 transition-colors">Yes</button>
                      <button onClick={handleCancelDelete} className="px-3 py-1 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 transition-colors">No</button>
                    </>
                  ) : (
                    <button onClick={(e) => handleDeleteClick(e, row.id)} disabled={deletingId === row.id} className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" aria-label="Delete">
                      {deletingId === row.id
                        ? <div className="w-4 h-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            {filtered.length} generation{filtered.length !== 1 ? "s" : ""}
            {showFavoritesOnly ? " favorited" : search ? " matching your search" : " total"}
          </p>
        )}
      </div>
    </div>
  );
};

export default History;
