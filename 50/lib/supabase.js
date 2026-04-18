// Supabase client configuration
const SUPABASE_URL = 'https://tzrsdfjfhfdarekqniiq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6cnNkZmpmaGZkYXJla3FuaWlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNjI5MTksImV4cCI6MjA4NTczODkxOX0.4oLn_O6lo3tdqD6ZBX9aw4ASUAQq4jASyQ-9d4vXz_k';

// Import Supabase client from CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket name
export const STORAGE_BUCKET = 'diana-images';
