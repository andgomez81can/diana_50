// Supabase client configuration
const SUPABASE_URL = 'https://glankwjwwzwpbcwrjwte.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsYW5rd2p3d3p3cGJjd3Jqd3RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNTg3NTIsImV4cCI6MjA4NTczNDc1Mn0.LExf0Z5du1H5VJ-P_29TsBIQy9pSzPflAfBjCetHKqI';

// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket name
export const STORAGE_BUCKET = 'diana-images';
