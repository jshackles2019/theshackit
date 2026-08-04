import { addEstimateLineItemAction, createEstimateAction, finalizeEstimateAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getAdminEstimates } from "@/lib/content";
import { money } from "@/lib/utils";

export default async function AdminEstimatesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const estimates = await getAdminEstimates();

  return (
    <DashboardShell
      title="Estimate builder"
      description="Create client-facing estimates with internal cost and markup hidden from client views."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={createEstimateAction} className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <h2 className="text-lg font-semibold">Create a draft estimate</h2>
          <input type="hidden" name="redirectTo" value="/dashboard/admin/estimates" />
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contact ID
              <input name="contactId" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Estimate title
              <input name="title" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Notes
              <textarea name="notes" rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Create estimate</button>
          </div>
        </form>

        <form action={addEstimateLineItemAction} className="rounded-3xl bg-sky-50 p-6 text-slate-950">
          <h2 className="text-lg font-semibold">Add a line item</h2>
          <input type="hidden" name="redirectTo" value="/dashboard/admin/estimates" />
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Estimate ID
              <input name="estimateId" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <input name="description" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Quantity
                <input name="quantity" type="number" step="1" min="1" defaultValue="1" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Sell price
                <input name="unitSellPrice" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Internal cost
                <input name="unitCostPrice" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Markup %
                <input name="markupPct" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <button className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">Add item</button>
          </div>
        </form>
      </div>

      <article className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Estimate preview</h2>
        <div className="mt-4 space-y-4">
          {estimates.length > 0 ? estimates.map((estimate) => (
            <div key={estimate.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{estimate.estimateNumber}</p>
                  <p className="text-sm text-slate-600">{estimate.title}</p>
                  <p className="text-sm text-slate-500">{estimate.contactName ?? "Unassigned"} • {estimate.contactEmail ?? "No contact email"}</p>
                </div>
                <div className="text-sm text-slate-600">
                  Sell {money(estimate.totalSell)} • Internal {money(estimate.totalCost)}
                </div>
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                {estimate.status} • {estimate.visibleToClient ? "Visible to client" : "Internal draft"}
              </div>
            </div>
          )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No estimates saved yet.</div>}
        </div>
        <form action={finalizeEstimateAction} className="mt-6">
          <input type="hidden" name="redirectTo" value="/dashboard/admin/estimates" />
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Estimate ID to finalize
            <input name="estimateId" className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <button className="mt-4 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Finalize estimate</button>
        </form>
      </article>
    </DashboardShell>
  );
}
