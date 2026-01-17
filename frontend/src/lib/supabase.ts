'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bwwauiisvxkdnossqzto.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3d2F1aWlzdnhrZG5vc3NxenRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NTQyNDUsImV4cCI6MjA4NDIzMDI0NX0.Wdl-ksRUwQiWbEnPMlknWfpoHYwPy6HsJ8ZGEESn6Uo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
