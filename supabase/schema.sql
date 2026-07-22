-- SynapseBoard Supabase Schema & Row Level Security (RLS) Policies

CREATE TABLE IF NOT EXISTS rooms (
  id VARCHAR(32) PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Untitled Architecture Board',
  is_public BOOLEAN DEFAULT true,
  snapshot_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow public read access to rooms
CREATE POLICY "Public rooms are readable by everyone" ON rooms
  FOR SELECT USING (is_public = true);

-- Allow room creation
CREATE POLICY "Anyone can create a room" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow room updates
CREATE POLICY "Anyone can update room snapshots" ON rooms
  FOR UPDATE USING (true);
