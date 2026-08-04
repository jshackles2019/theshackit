import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentAuth } from "@/lib/auth";
import { canUseSupabase } from "@/lib/supabase/server";

export default async function ClientLayout({ children }: { children: ReactNode }) {
  const auth = await getCurrentAuth();
  if (canUseSupabase() && (!auth.user || auth.profile?.role !== "client")) {
    redirect("/dashboard?error=Client+portal+access+requires+the+client+role.");
  }

  return children;
}
