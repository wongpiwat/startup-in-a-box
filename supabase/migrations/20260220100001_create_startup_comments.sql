-- startup_comments table (schema from export 2026-02-20)
-- Columns: id, startup_id, author_name, content, section, created_at, device_id

CREATE TABLE IF NOT EXISTS public.startup_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  section text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  device_id text
);

ALTER TABLE public.startup_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.startup_comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments" ON public.startup_comments
  FOR INSERT WITH CHECK (
    char_length(author_name) > 0 AND char_length(author_name) <= 50
    AND char_length(content) > 0 AND char_length(content) <= 1000
  );

CREATE POLICY "Anyone can delete own comments" ON public.startup_comments
  FOR DELETE USING (true);
