-- StudyLoop Supabase Postgres Schema
-- Run this in your Supabase SQL Editor to provision tables, indexes, and Row Level Security (RLS)

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  timezone TEXT DEFAULT 'America/New_York (EST)',
  preferred_session_length INT DEFAULT 45,
  preferred_break_length INT DEFAULT 10,
  preferred_time_of_day TEXT DEFAULT 'evening',
  max_daily_sessions INT DEFAULT 4,
  weekly_availability JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  color TEXT DEFAULT '#10b981',
  instructor TEXT,
  notes TEXT,
  target_grade TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  course_name TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE NOT NULL,
  estimated_hours NUMERIC(4,1) DEFAULT 3.0,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  source_document_name TEXT,
  source_excerpt TEXT,
  page_reference TEXT,
  needs_review BOOLEAN DEFAULT FALSE,
  review_reason TEXT,
  priority_rationale TEXT,
  required_materials JSONB DEFAULT '[]'::jsonb,
  instructions TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. Study Sessions (Scheduled Blocks)
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  course_name TEXT NOT NULL,
  course_color TEXT DEFAULT '#10b981',
  scheduled_date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped', 'missed')) DEFAULT 'scheduled',
  priority_rationale TEXT,
  session_objective TEXT,
  is_recovered BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  actual_minutes INT
);

-- 5. Focus Logs (Completed sessions)
CREATE TABLE IF NOT EXISTS public.focus_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  task_title TEXT,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  target_minutes INT NOT NULL,
  mode TEXT NOT NULL,
  completed_fully BOOLEAN DEFAULT TRUE,
  notes TEXT
);

-- 6. Focus Reflections (Coach Check-ins)
CREATE TABLE IF NOT EXISTS public.focus_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  task_title TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  factor TEXT NOT NULL,
  notes TEXT,
  ai_suggested_adjustment TEXT
);

-- 7. Private Materials Storage & Metadata
CREATE TABLE IF NOT EXISTS public.uploaded_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT, -- private Supabase storage path
  status TEXT DEFAULT 'extracted',
  extracted_tasks_count INT DEFAULT 0,
  course_guess TEXT,
  raw_excerpt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_materials ENABLE ROW LEVEL SECURITY;

-- Helper policies: each student accesses only their own records
CREATE POLICY "Users can access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access own courses" ON public.courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own study_sessions" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own focus_logs" ON public.focus_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own focus_reflections" ON public.focus_reflections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own uploaded_materials" ON public.uploaded_materials FOR ALL USING (auth.uid() = user_id);

