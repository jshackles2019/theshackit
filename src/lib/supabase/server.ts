import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getEnv, hasSupabaseConfig } from "@/lib/env";

export function canUseSupabase() {
  return hasSupabaseConfig();
}

export async function createSupabaseServerClient() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const env = getEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
}
