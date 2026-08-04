import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentAuth } from "@/lib/auth";
import { canUseSupabase, createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AdminViewAsClientLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ clientId: string }>;
}) {
  const auth = await getCurrentAuth();
  
  // Verify user is admin
  if (canUseSupabase() && (!auth.user || auth.profile?.role !== "admin")) {
    redirect("/dashboard?error=Admin+access+required.");
  }

  // Verify the client exists
  if (canUseSupabase()) {
    const { clientId } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: clientData } = await supabase
      .from("crm_contacts")
      .select("id, full_name, email")
      .eq("id", clientId)
      .single();

    if (!clientData) {
      redirect("/dashboard/admin/clients?error=Client+not+found.");
    }
  }

  return children;
}
