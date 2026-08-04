import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentAuth } from "@/lib/auth";
import { getClientEstimates } from "@/lib/content";
import { money } from "@/lib/utils";

export default async function ClientDashboardPage() {
  const [auth, estimates] = await Promise.all([getCurrentAuth(), getClientEstimates()]);
  const includedServices = ["Help desk", "Patch management", "Workstation support", "Basic software support"];

  return (
    <DashboardShell
      title="Client portal"
      description="See service coverage, estimate status, and account details once client access is assigned."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Signed in</p>
          <p className="mt-3 text-lg font-semibold">{auth.profile?.full_name ?? "Preview client"}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Estimate total</p>
          <p className="mt-3 text-2xl font-semibold">{estimates.length > 0 ? money(estimates.reduce((sum, estimate) => sum + estimate.totalSell, 0)) : "$0.00"}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Service level</p>
          <p className="mt-3 text-lg font-semibold">Managed IT Services</p>
        </article>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold">Current service agreement</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {includedServices.map((service) => (
              <li key={service}>• {service}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold">Account balance</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-600">Current balance</p>
              <p className="mt-2 text-2xl font-semibold">$0.00</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-600">Upcoming charges</p>
              <p className="mt-2 text-2xl font-semibold">$650.00</p>
            </div>
          </div>
        </article>
      </div>

      <article className="mt-8 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Finalized estimates</h2>
        <div className="mt-4 space-y-3">
          {estimates.length > 0 ? estimates.map((estimate) => (
            <div key={estimate.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-semibold">{estimate.estimateNumber}</p>
              <p className="text-sm text-slate-600">{estimate.title}</p>
              <p className="text-sm text-slate-500">{estimate.contactName ?? "No linked contact"}</p>
            </div>
          )) : <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">No finalized estimates are visible to your account yet.</div>}
        </div>
      </article>
    </DashboardShell>
  );
}
