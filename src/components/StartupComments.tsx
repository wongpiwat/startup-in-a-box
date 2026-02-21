import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Send, User, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getDeviceId } from "@/lib/device-id";

interface Comment {
  id: string;
  author_name: string;
  content: string;
  section: string | null;
  created_at: string;
  device_id: string | null;
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);
  const myDeviceId = getDeviceId();

  const canDelete = (c: Comment) => isAdmin || c.device_id === myDeviceId;

  const handleAdminLogin = () => {
    if (adminPassword.trim()) {
      setIsAdmin(true);
      setShowAdminPrompt(false);
      toast.success("Admin mode enabled");
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    setDeletingId(comment.id);
    if (isAdmin) {
      const { data, error } = await supabase.functions.invoke("admin-delete-comment", {
        body: { password: adminPassword, comment_id: comment.id },
      });
      if (error || data?.error) {
        toast.error(data?.error || "Failed to delete comment");
      } else {
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
        toast.success("Comment deleted");
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from("startup_comments").delete().eq("id", comment.id).eq("device_id", myDeviceId);
      if (error) {
        toast.error("Failed to delete comment");
      } else {
        setComments((prev) => prev.filter((c) => c.id !== comment.id));
        toast.success("Comment deleted");
      }
    }
    setDeletingId(null);
  };

  useEffect(() => {
    const fetch = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from("startup_comments").select("*").eq("startup_id", startupId).order("created_at", { ascending: true });
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
    if (trimmedName.length > 50) {
      toast.error("Name must be 50 characters or less.");
      return;
    }
    if (trimmedContent.length > 1000) {
      toast.error("Comment must be 1000 characters or less.");
      return;
    }

    setSubmitting(true);
    localStorage.setItem("comment_name", trimmedName);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).from("startup_comments").insert({ startup_id: startupId, author_name: trimmedName, content: trimmedContent, device_id: myDeviceId }).select().single();

    if (error) {
      toast.error("Failed to post comment.");
    } else if (data) {
      setComments((prev) => [...prev, data as Comment]);
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
    <>
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h3
              className="text-lg font-bold select-none"
              onClick={(e) => {
                if (e.detail === 3) {
                  if (isAdmin) {
                    setIsAdmin(false);
                    setAdminPassword("");
                    toast("Admin mode disabled");
                  } else {
                    setShowAdminPrompt((v) => !v);
                  }
                }
              }}>
              Comments
            </h3>
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{comments.length}</span>
            {isAdmin && (
              <span className="text-xs text-destructive bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>

          {showAdminPrompt && !isAdmin && (
            <div className="flex gap-2 mb-4">
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                placeholder="Admin password"
                className="flex-1 bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              />
              <Button size="sm" onClick={handleAdminLogin}>
                Login
              </Button>
            </div>
          )}

          {/* Comment list */}
          {loading ? (
            <div className="text-sm text-muted-foreground py-4">Loading comments...</div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">No comments yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="space-y-4 mb-6">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{c.author_name}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>
                      {canDelete(c) && (
                        <button onClick={() => setCommentToDelete(c)} disabled={deletingId === c.id} className="ml-auto text-destructive/60 hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                maxLength={50}
                className="w-40 bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
              />
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts on this startup..."
                  maxLength={1000}
                  className="flex-1 bg-secondary/50 border border-border/60 rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
                />
                <Button type="submit" size="sm" disabled={submitting || !name.trim() || !content.trim()} className="gap-1.5 shrink-0">
                  <Send className="w-3.5 h-3.5" />
                  Post
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <AlertDialog open={!!commentToDelete} onOpenChange={(open) => !open && setCommentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the comment.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (commentToDelete) {
                  handleDeleteComment(commentToDelete);
                  setCommentToDelete(null);
                }
              }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StartupComments;
