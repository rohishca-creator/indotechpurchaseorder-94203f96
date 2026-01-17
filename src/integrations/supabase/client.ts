// This file re-exports from runtimeClient to ensure fallback safety.
// All app code should import from "@/integrations/supabase/runtimeClient".
export { supabase } from './runtimeClient';
