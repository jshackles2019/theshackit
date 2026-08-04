import { SiteHeaderClient } from "./site-header-client";
import { getCurrentAuth } from "@/lib/auth";
import { canUseSupabase } from "@/lib/supabase/server";

export async function SiteHeader() {
  let isAuthenticated = false;
  let isAdmin = false;
  let isClient = false;

  if (canUseSupabase()) {
    try {
      const auth = await getCurrentAuth();
      isAuthenticated = !!auth.profile;
      isAdmin = auth.profile?.role === "admin";
      isClient = auth.profile?.role === "client";
    } catch {
      // Silently fail if auth cannot be loaded
    }
  }

  return <SiteHeaderClient isAuthenticated={isAuthenticated} isAdmin={isAdmin} isClient={isClient} />;
}
