import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Fallbacks ensure the app can boot even if build-time env injection fails on some devices.
// These values are not secrets (publishable client config).
const FALLBACK_SUPABASE_URL = "https://rxssuyhjmcystpeqqfwb.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c3N1eWhqbWN5c3RwZXFxZndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjExODAsImV4cCI6MjA4NDE5NzE4MH0.BQlNAwhiZAUZGvWZSfuMgda3yiyX89SnqdltHxzLbiU";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
