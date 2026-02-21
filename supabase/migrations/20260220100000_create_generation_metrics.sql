-- generation_metrics table (schema from export 2026-02-20)
-- Columns: id, created_at, idea, startup_name, category, generation_time_ms, prompt_tokens, completion_tokens, total_tokens, output_length, confidence_score, result_json, is_favorite, logo_url, record_type, device_id

CREATE TABLE IF NOT EXISTS public.generation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  idea text NOT NULL,
  startup_name text,
  category text,
  generation_time_ms integer,
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  output_length integer,
  confidence_score integer,
  result_json jsonb,
  is_favorite boolean DEFAULT false,
  logo_url text,
  record_type text NOT NULL DEFAULT 'startup',
  device_id text
);
