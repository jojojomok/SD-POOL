-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (syncs with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('pm', 'boss', 'stakeholder')),
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Requirements table
CREATE TABLE requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  brief TEXT,
  description TEXT,
  prd_url TEXT,
  mockup_url TEXT,
  submitter_id UUID NOT NULL REFERENCES users(id),
  system TEXT[] DEFAULT '{}',
  module TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('P0', 'P1', 'P2', 'P3', 'P4')),
  deadline DATE,
  estimate NUMERIC,
  assignee_id UUID REFERENCES users(id),
  version TEXT,
  quarter TEXT,
  status TEXT NOT NULL DEFAULT '待跟进',
  phase INTEGER NOT NULL DEFAULT 1,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Operation logs table
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES requirements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  detail JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_requirements_status ON requirements(status);
CREATE INDEX idx_requirements_phase ON requirements(phase);
CREATE INDEX idx_requirements_submitter ON requirements(submitter_id);
CREATE INDEX idx_comments_requirement ON comments(requirement_id);
CREATE INDEX idx_logs_requirement ON logs(requirement_id);

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requirements_updated_at
  BEFORE UPDATE ON requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies: all authenticated users can read everything
CREATE POLICY "users_can_read_all" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "requirements_read_all" ON requirements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "comments_read_all" ON comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "logs_read_all" ON logs FOR SELECT USING (auth.role() = 'authenticated');

-- RLS: insert/update/delete policies per role
CREATE POLICY "anyone_can_insert_requirements" ON requirements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "pm_boss_update_requirements" ON requirements FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('pm', 'boss'))
);
CREATE POLICY "stakeholder_update_own" ON requirements FOR UPDATE USING (
  submitter_id = auth.uid() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'stakeholder')
);
CREATE POLICY "pm_boss_delete_requirements" ON requirements FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('pm', 'boss'))
);

CREATE POLICY "anyone_can_insert_comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "anyone_can_insert_logs" ON logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Migration: Add quarter column
ALTER TABLE requirements ADD COLUMN quarter TEXT;
CREATE INDEX IF NOT EXISTS idx_requirements_quarter ON requirements(quarter);
