-- PrepStak Initial Schema
-- Run against a Supabase project's SQL editor or via supabase db push

-- Learning standards (TEKS, grades 6-12, science + math)
CREATE TABLE IF NOT EXISTS standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL DEFAULT 'TX',
  framework TEXT NOT NULL DEFAULT 'TEKS',
  subject TEXT NOT NULL,
  course TEXT,
  grade_level TEXT NOT NULL,
  strand TEXT,
  standard_code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_standards_subject ON standards(subject);
CREATE INDEX idx_standards_grade ON standards(grade_level);
CREATE INDEX idx_standards_course ON standards(course);
CREATE INDEX idx_standards_code ON standards(standard_code);
CREATE INDEX idx_standards_search ON standards USING gin(to_tsvector('english', description));

-- Teacher profiles
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY,
  name TEXT,
  grade_levels TEXT[] DEFAULT '{}',
  subjects TEXT[] DEFAULT '{}',
  school_type TEXT,
  school_name TEXT,
  district TEXT,
  state TEXT DEFAULT 'TX',
  student_demographics JSONB,
  teaching_philosophy TEXT,
  available_tech TEXT[] DEFAULT '{}',
  special_programs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unit/Lesson workspaces
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  standard_ids UUID[] DEFAULT '{}',
  subject TEXT,
  grade_level TEXT,
  unit_topic TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_teacher ON projects(teacher_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Generated assets within a project
CREATE TABLE IF NOT EXISTS project_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  skill_id TEXT,
  asset_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_assets_project ON project_assets(project_id);
CREATE INDEX idx_assets_type ON project_assets(asset_type);

-- Skill definitions (for future custom skills — core skills live in code)
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  when_to_use TEXT,
  estimated_time TEXT,
  prompt_template TEXT NOT NULL,
  produces TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'library',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reusable teaching context files
CREATE TABLE IF NOT EXISTS context_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_context_teacher ON context_files(teacher_id);
CREATE INDEX idx_context_project ON context_files(project_id);
CREATE INDEX idx_context_category ON context_files(category);

-- Enable Row Level Security on all tables
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_files ENABLE ROW LEVEL SECURITY;

-- Standards are publicly readable
CREATE POLICY "Standards are publicly readable"
  ON standards FOR SELECT
  USING (true);

-- Skills are publicly readable
CREATE POLICY "Skills are publicly readable"
  ON skills FOR SELECT
  USING (true);

-- For MVP with service-role key, allow all operations
-- In Phase 2, these will be scoped to auth.uid()
CREATE POLICY "Allow all on teacher_profiles (MVP)"
  ON teacher_profiles FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on projects (MVP)"
  ON projects FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on project_assets (MVP)"
  ON project_assets FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on context_files (MVP)"
  ON context_files FOR ALL
  USING (true) WITH CHECK (true);
