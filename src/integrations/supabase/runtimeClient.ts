import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Fallbacks ensure the app can boot even if build-time env injection fails on some devices.
const FALLBACK_SUPABASE_URL = "https://rxssuyhjmcystpeqqfwb.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4c3N1eWhqbWN5c3RwZXFxZndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MjExODAsImV4cCI6MjA4NDE5NzE4MH0.BQlNAwhiZAUZGvWZSfuMgda3yiyX89SnqdltHxzLbiU";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

// Custom fetch with AbortController timeout and detailed logging
const REQUEST_TIMEOUT_MS = 25000;

const customFetch = (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  
  const method = options?.method || 'GET';
  const urlString = typeof url === 'string' ? url : url.toString();
  const startTime = Date.now();
  
  console.log(`[supabase] ${method} ${urlString.split('?')[0]} started`);

  return fetch(url, { ...options, signal: controller.signal })
    .then((response) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      console.log(`[supabase] ${method} completed in ${duration}ms, status: ${response.status}`);
      return response;
    })
    .catch((error) => {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      if (error.name === 'AbortError') {
        console.error(`[supabase] ${method} ABORTED after ${duration}ms (timeout: ${REQUEST_TIMEOUT_MS}ms)`);
        throw new Error('Request timed out. Please check your network connection and try again.');
      }
      console.error(`[supabase] ${method} FAILED after ${duration}ms:`, error.message);
      throw error;
    });
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: customFetch,
  },
});
