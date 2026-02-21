ALTER TABLE public.startup_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments" ON public.startup_comments
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert comments" ON public.startup_comments
  FOR INSERT WITH CHECK (
    char_length(author_name) > 0 AND char_length(author_name) <= 50
    AND char_length(content) > 0 AND char_length(content) <= 1000
  );