"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getEnv } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (!client) {
    const env = getEnv();
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("Supabase environment variables are not configured.");
    }

    client = createBrowserClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
  }

  return client;
}
