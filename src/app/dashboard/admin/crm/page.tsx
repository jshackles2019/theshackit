import { addCrmActivityAction, saveContactAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { crmStages } from "@/lib/site";
import { seedContacts } from "@/lib/mock-data";

export default function AdminCrmPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  return (
    <DashboardShell
      title="CRM workspace"
      description="Track leads, prospects, clients, notes, tasks, follow-ups, and pipeline stages."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveContactAction} className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <h2 className="text-lg font-semibold">Create or update a contact</h2>
          <input type="hidden" name="redirectTo" value="/dashboard/admin/crm" />
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Full name
              <input name="fullName" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input name="email" type="email" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Company
              <input name="companyName" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Pipeline stage
              <select name="pipelineStage" className="rounded-2xl border border-slate-300 px-4 py-3">
                {crmStages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Notes
              <textarea name="notes" rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Billing frequency
                <input name="billingFrequency" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Monthly" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Monthly amount
                <input name="monthlyAmount" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                SLA start date
                <input name="slaStartDate" type="date" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                SLA end date
                <input name="slaEndDate" type="date" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Included services
              <textarea name="includedServices" rows={3} className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Help desk, patching, workstation support" />
            </label>
            <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Save contact</button>
          </div>
        </form>

        <form action={addCrmActivityAction} className="rounded-3xl bg-sky-50 p-6 text-slate-950">
          <h2 className="text-lg font-semibold">Log activity</h2>
          <input type="hidden" name="redirectTo" value="/dashboard/admin/crm" />
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contact ID
              <input name="contactId" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="contact UUID" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Activity type
              <input name="activityType" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="note / task / follow-up" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Activity note
              <textarea name="note" rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Follow-up date
              <input name="followUpAt" type="date" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">Log activity</button>
          </div>
        </form>
      </div>

      <article className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Seeded CRM preview</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {seedContacts.map((contact) => (
            <div key={contact.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold">{contact.name}</p>
              <p className="text-sm text-slate-600">{contact.company_name}</p>
              <p className="mt-2 text-sm text-slate-600">
                {contact.stage} • {contact.service_agreement}
              </p>
            </div>
          ))}
        </div>
      </article>
    </DashboardShell>
  );
}
