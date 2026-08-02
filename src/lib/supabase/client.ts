"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getEnv, getSupabasePublishableKey } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (!client) {
    const env = getEnv();
    const supabaseKey = getSupabasePublishableKey();
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !supabaseKey) {
      throw new Error("Supabase environment variables are not configured.");
    }

    client = createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, supabaseKey);
  }

  return client;
}
