-- ============================================================
-- DuoTracker Complete Supabase Database Setup SQL
-- ============================================================
-- Copy and paste all lines below into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. Create table for weekly study data and schedule config
CREATE TABLE IF NOT EXISTS public.duotracker_weeks (
  id TEXT PRIMARY KEY,
  week_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create table for past weeks history and archives
CREATE TABLE IF NOT EXISTS public.duotracker_history (
  id TEXT PRIMARY KEY,
  records JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.duotracker_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duotracker_history ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if re-running script
DROP POLICY IF EXISTS "Allow public read on duotracker_weeks" ON public.duotracker_weeks;
DROP POLICY IF EXISTS "Allow public insert/update on duotracker_weeks" ON public.duotracker_weeks;
DROP POLICY IF EXISTS "Allow public read on duotracker_history" ON public.duotracker_history;
DROP POLICY IF EXISTS "Allow public insert/update on duotracker_history" ON public.duotracker_history;

-- 5. Create policies for anonymous public access
CREATE POLICY "Allow public read on duotracker_weeks"
  ON public.duotracker_weeks FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert/update on duotracker_weeks"
  ON public.duotracker_weeks FOR ALL
  USING (true);

CREATE POLICY "Allow public read on duotracker_history"
  ON public.duotracker_history FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert/update on duotracker_history"
  ON public.duotracker_history FOR ALL
  USING (true);

-- 6. Verify table structures
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
