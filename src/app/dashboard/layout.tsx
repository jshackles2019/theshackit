import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentAuth } from "@/lib/auth";
import { canUseSupabase } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const auth = await getCurrentAuth();
  if (canUseSupabase() && !auth.user) {
    redirect("/auth/sign-in");
  }

  return children;
}
