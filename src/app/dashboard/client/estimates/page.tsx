import { createClientEstimateRequestAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getClientEstimates } from "@/lib/content";
import { money } from "@/lib/utils";

export default async function ClientEstimatesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const estimates = await getClientEstimates();

  return (
    <DashboardShell
      title="Client estimates"
      description="View finalized estimates only and request new work without editing draft estimates."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <form action={createClientEstimateRequestAction} className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
        <input type="hidden" name="redirectTo" value="/dashboard/client/estimates" />
        <h2 className="text-lg font-semibold">Request a new estimate</h2>
        <div className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Request summary
            <textarea name="summary" required rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Submit request</button>
        </div>
      </form>

      <article className="mt-6 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Finalized estimates</h2>
        <div className="mt-4 space-y-4">
          {estimates.length > 0 ? estimates.map((estimate) => (
            <div key={estimate.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{estimate.estimateNumber}</p>
                  <p className="text-sm text-slate-600">{estimate.title}</p>
                  <p className="text-sm text-slate-500">{estimate.contactName ?? "No linked contact"}</p>
                </div>
                <div className="text-sm font-medium text-slate-950">{money(estimate.totalSell)}</div>
              </div>
              {estimate.lineItems.length > 0 ? (
               <div className="mt-4 border-t border-slate-200 pt-4">
                 <p className="text-sm font-semibold text-slate-900">Estimate breakdown</p>
                 <div className="mt-3 space-y-2">
                   {estimate.lineItems.map((item) => (
                     <div key={item.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                       <div>
                         <p className="font-medium text-slate-900">{item.description}</p>
                         <p className="text-sm text-slate-600">Qty {item.quantity} • {money(item.unitSellPrice)} each</p>
                       </div>
                       <div className="text-sm font-medium text-slate-900">{money(item.lineTotalSell)}</div>
                     </div>
                   ))}
                 </div>
               </div>
              ) : <div className="mt-4 text-sm text-slate-500">No line items have been added to this estimate yet.</div>}
            </div>
          )) : <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">No finalized estimates are visible to your account yet.</div>}
        </div>
      </article>
    </DashboardShell>
  );
}
