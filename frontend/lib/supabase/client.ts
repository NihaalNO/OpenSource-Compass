"use client";

import { createClient } from "@supabase/supabase-js";
import { frontendEnv } from "../env";

let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!frontendEnv.supabaseUrl || !frontendEnv.supabaseAnonKey) {
    throw new Error("Supabase frontend environment variables are required for authentication.");
  }

  supabaseClient ??= createClient(frontendEnv.supabaseUrl, frontendEnv.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  return supabaseClient;
}

