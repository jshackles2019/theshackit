import { createSupabaseServerClient, canUseSupabase } from "@/lib/supabase/server";
import { dashboardRoles, type DashboardRole } from "@/lib/site";

export type SessionProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: DashboardRole;
  company_name: string | null;
  phone: string | null;
  title: string | null;
};

export async function getCurrentAuth() {
  if (!canUseSupabase()) {
    return { user: null, profile: null };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { user: null, profile: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, company_name, phone, title")
    .eq("id", data.user.id)
    .maybeSingle<SessionProfile>();

  return {
    user: data.user,
    profile:
      profile ??
      ({
        id: data.user.id,
        email: data.user.email ?? "",
        full_name: data.user.user_metadata?.full_name ?? data.user.email ?? null,
        role: "user",
        company_name: null,
        phone: null,
        title: null,
      } satisfies SessionProfile),
  };
}

export async function requireRole(allowedRoles: DashboardRole[]) {
  const auth = await getCurrentAuth();
  if (!auth.user || !auth.profile) {
    return { authorized: false as const, role: null };
  }

  const role = dashboardRoles.includes(auth.profile.role)
    ? auth.profile.role
    : "user";

  return {
    authorized: allowedRoles.includes(role),
    role,
    auth,
  };
}
