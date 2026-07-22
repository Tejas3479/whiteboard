-- SynapseBoard Supabase Schema & Row Level Security (RLS) Policies

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(32) PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Architecture Board',
  is_public BOOLEAN DEFAULT true,
  snapshot_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shape Context Layer Table (Per-element Notes, Links, Code, & File metadata)
CREATE TABLE IF NOT EXISTS shape_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id VARCHAR(32) NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  shape_id VARCHAR(128) NOT NULL,
  notes TEXT DEFAULT '',
  links_json JSONB DEFAULT '[]'::jsonb,
  code_snippets_json JSONB DEFAULT '[]'::jsonb,
  files_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, shape_id)
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE shape_contexts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to rooms & shape_contexts
CREATE POLICY "Public rooms are readable by everyone" ON rooms
  FOR SELECT USING (is_public = true);

CREATE POLICY "Public shape contexts are readable by everyone" ON shape_contexts
  FOR SELECT USING (true);

-- Allow room & shape context creation
CREATE POLICY "Anyone can create a room" ON rooms
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert shape contexts" ON shape_contexts
  FOR INSERT WITH CHECK (true);

-- Allow room & shape context updates
CREATE POLICY "Anyone can update room snapshots" ON rooms
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can update shape contexts" ON shape_contexts
  FOR UPDATE USING (true);
