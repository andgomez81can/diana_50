-- Create RSVPs table for Diana's 50th Birthday
CREATE TABLE rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  guests INTEGER NOT NULL,
  dietary TEXT,
  message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert RSVPs (public form submission)
CREATE POLICY "Anyone can insert RSVPs"
  ON rsvps FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read RSVPs (public messages display)
CREATE POLICY "Anyone can read RSVPs"
  ON rsvps FOR SELECT
  USING (true);

-- Create index for faster timestamp-based queries
CREATE INDEX idx_rsvps_timestamp ON rsvps(timestamp DESC);

-- Create index for email lookups (optional, for future features)
CREATE INDEX idx_rsvps_email ON rsvps(email);
