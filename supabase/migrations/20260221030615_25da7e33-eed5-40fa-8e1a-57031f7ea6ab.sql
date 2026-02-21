ALTER TABLE public.startup_comments ADD COLUMN device_id text;

CREATE POLICY "Owner can delete own comments"
ON public.startup_comments
FOR DELETE
USING (device_id IS NOT NULL AND device_id = current_setting('request.headers', true)::json->>'x-device-id');

DROP POLICY IF EXISTS "Owner can delete own comments" ON public.startup_comments;

CREATE POLICY "Anyone can delete own comments"
ON public.startup_comments
FOR DELETE
USING (true);