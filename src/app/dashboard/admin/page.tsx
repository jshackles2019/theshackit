import { DashboardShell } from "@/components/dashboard-shell";
import { crmStages } from "@/lib/site";
import { getCurrentAuth } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const auth = await getCurrentAuth();

  return (
    <DashboardShell
      title="Admin workspace"
      description="Manage services, CRM, estimates, and website content from inside the app."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <h2 className="text-lg font-semibold">Admin access</h2>
          <p className="mt-3 text-sm text-slate-600">
            {auth.profile?.role === "admin"
              ? "You are signed in as an admin."
              : "Preview mode is active until Supabase auth is connected."}
          </p>
        </article>
        <article className="rounded-3xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold">CRM pipeline stages</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {crmStages.map((stage) => (
              <span key={stage} className="rounded-full bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
                {stage}
              </span>
            ))}
          </div>
        </article>
      </div>
    </DashboardShell>
  );
}
