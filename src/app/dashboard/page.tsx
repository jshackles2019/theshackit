import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getCurrentAuth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const [auth, stats] = await Promise.all([getCurrentAuth(), getDashboardStats()]);
  const isAdmin = auth.profile?.role === "admin";
  const isClient = auth.profile?.role === "client";

  return (
    <DashboardShell
      title="Account dashboard"
      description="A single place for owner, admin, and client workflows."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Current role</p>
          <p className="mt-3 text-2xl font-semibold">{auth.profile?.role ?? "Preview"}</p>
          <p className="mt-2 text-sm text-slate-600">{auth.user?.email ?? "Supabase not connected yet."}</p>
          {auth.user?.id ? <p className="mt-1 text-xs text-slate-500">User ID: {auth.user.id}</p> : null}
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Contacts</p>
          <p className="mt-3 text-2xl font-semibold">{stats.contacts}</p>
          <p className="mt-2 text-sm text-slate-600">{stats.isAdmin ? "Live CRM contacts in Supabase." : "Admin-only CRM data will appear here after sign-in."}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Estimates</p>
          <p className="mt-3 text-2xl font-semibold">{stats.estimates}</p>
          <p className="mt-2 text-sm text-slate-600">{stats.isAdmin ? "Live estimates stored in Supabase." : "Estimate visibility depends on your access level."}</p>
        </article>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold">Quick links</h2>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {isAdmin ? (
              <Link href="/dashboard/admin" className="rounded-full bg-slate-950 px-4 py-2 text-white">
                Admin tools
              </Link>
            ) : (
              <div className="rounded-full border border-slate-300 px-4 py-2 text-slate-600">
                Admin tools require the admin role.
              </div>
            )}
            {isClient ? (
              <Link href="/dashboard/client" className="rounded-full border border-slate-300 px-4 py-2 text-slate-950">
                Client portal
              </Link>
            ) : (
              <div className="rounded-full border border-slate-300 px-4 py-2 text-slate-600">
                Client portal access requires the client role.
              </div>
            )}
            {isAdmin ? (
              <Link href="/dashboard/admin/invoices" className="rounded-full border border-slate-300 px-4 py-2 text-slate-950">
                Invoices
              </Link>
            ) : null}
            {isClient ? (
              <Link href="/dashboard/client/invoices" className="rounded-full border border-slate-300 px-4 py-2 text-slate-950">
                Client invoices
              </Link>
            ) : null}
          </div>
        </article>
        <article className="rounded-3xl bg-sky-50 p-6">
          <h2 className="text-lg font-semibold">Workflow focus</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            CRM tracking, service management, estimate generation, invoicing, consultation intake, and client service visibility.
          </p>
        </article>
      </div>
    </DashboardShell>
  );
}
