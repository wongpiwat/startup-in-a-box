CREATE TABLE public.startup_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL,
  section text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);