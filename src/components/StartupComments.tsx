import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  section: string | null;
  created_at: string;
}

interface Props {
  startupId: string;
}

const StartupComments = ({ startupId }: Props) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(() => localStorage.getItem("comment_name") ?? "");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("startup_comments")
        .select("*")
        .eq("startup_id", startupId)
        .order("created_at", { ascending: true });
      if (data) setComments(data as Comment[]);
      setLoading(false);
    };
    fetch();
  }, [startupId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedContent = content.trim();
    if (!trimmedName || !trimmedContent) return;
    if (trimmedName.length > 50) { toast.error("Name must be 50 characters or less."); return; }
    if (trimmedContent.length > 1000) { toast.error("Comment must be 1000 characters or less."); return; }

    setSubmitting(true);
    localStorage.setItem("comment_name", trimmedName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from("startup_comments")
      .insert({ startup_id: startupId, author_name: trimmedName, content: trimmedContent })
      .select()
      .single();

    if (error) {
      toast.error("Failed to post comment.");
    } else if (data) {
      setComments(prev => [...prev, data as Comment]);
      setContent("");
      toast.success("Comment posted!");
    }
    setSubmitting(false);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const diffMins = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pb-16">
      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold">Comments</h3>
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{comments.length}</span>
        </div>

        {/* Comment list */}
        {loading ? (
          <div className="text-sm text-muted-foreground py-4">Loading comments...</div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{c.author_name}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="w-40 bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
            />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Share your thoughts on this startup..."
                maxLength={1000}
                className="flex-1 bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              />
              <Button
                type="submit"
                size="sm"
                disabled={submitting || !name.trim() || !content.trim()}
                className="gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartupComments;
