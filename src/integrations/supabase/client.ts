import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kzkjeofueynaeelxstef.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6a2plb2Z1ZXluYWVlbHhzdGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjU5MTMsImV4cCI6MjA2MjA0MTkxM30.fbbYkKJhBexovOEPuCmrWXcC3CrDtV9bZxx-U_39w38";

// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);