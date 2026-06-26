import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import { ConfigurationError } from "./http-error.js";

let authClient: SupabaseClient | null = null;
let serviceClient: SupabaseClient | null = null;

function requireSupabaseConfig(key: "SUPABASE_URL" | "SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY") {
  const value = env[key];

  if (!value) {
    throw new ConfigurationError(`${key} is required for authentication features`);
  }

  return value;
}

export function getSupabaseAuthClient() {
  if (!authClient) {
    authClient = createClient(
      requireSupabaseConfig("SUPABASE_URL"),
      requireSupabaseConfig("SUPABASE_ANON_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }

  return authClient;
}

export function getSupabaseServiceClient() {
  if (!serviceClient) {
    serviceClient = createClient(
      requireSupabaseConfig("SUPABASE_URL"),
      requireSupabaseConfig("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  }

  return serviceClient;
}

