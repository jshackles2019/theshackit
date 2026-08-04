import {
  createInvoiceFromEstimateAction,
  recordInvoicePaymentAction,
  updateInvoiceAction,
} from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getAdminInvoices } from "@/lib/content";
import { money } from "@/lib/utils";

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const invoices = await getAdminInvoices();
  const totals = invoices.reduce(
    (acc, invoice) => ({
      total: acc.total + invoice.total,
      balance: acc.balance + invoice.balanceDue,
      paid: acc.paid + invoice.amountPaid,
    }),
    { total: 0, balance: 0, paid: 0 },
  );

  return (
    <DashboardShell
      title="Invoices and payments"
      description="Generate invoices from estimates, track balances, and record incoming payments."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Invoices</p>
          <p className="mt-3 text-2xl font-semibold">{invoices.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Invoiced total</p>
          <p className="mt-3 text-2xl font-semibold">{money(totals.total)}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Balance due</p>
          <p className="mt-3 text-2xl font-semibold">{money(totals.balance)}</p>
        </article>
      </div>

      <form action={createInvoiceFromEstimateAction} className="mt-6 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Generate invoice from estimate</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Estimate ID
            <input name="estimateId" required className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <button className="self-end rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Create invoice</button>
        </div>
      </form>

      <div className="mt-6 grid gap-6">
        {invoices.length > 0 ? invoices.map((invoice) => (
          <article key={invoice.id} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">{invoice.invoiceNumber}</p>
                <h2 className="mt-2 text-xl font-semibold">{invoice.title}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {invoice.contactName ?? "No contact linked"} • {invoice.contactEmail ?? "No email"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {invoice.estimateNumber ? `Estimate ${invoice.estimateNumber}` : "No linked estimate"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total {money(invoice.total)}</p>
                <p className="text-lg font-semibold text-slate-950">Balance {money(invoice.balanceDue)}</p>
                <p className="text-sm text-slate-500">{invoice.status}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-2">
              <form action={updateInvoiceAction} className="rounded-2xl bg-slate-50 p-4">
                <input type="hidden" name="redirectTo" value="/dashboard/admin/invoices" />
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Invoice details</h3>
                <div className="mt-4 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Title
                    <input name="title" defaultValue={invoice.title} className="rounded-2xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Notes
                    <textarea name="notes" rows={3} defaultValue={invoice.notes ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Status
                      <select name="status" defaultValue={invoice.status} className="rounded-2xl border border-slate-300 px-4 py-3">
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-medium text-slate-700">
                      Due date
                      <input name="dueDate" type="date" defaultValue={invoice.dueDate ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                    </label>
                  </div>
                  <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save invoice</button>
                </div>
              </form>

              <form action={recordInvoicePaymentAction} className="rounded-2xl bg-sky-50 p-4">
                <input type="hidden" name="redirectTo" value="/dashboard/admin/invoices" />
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Record payment</h3>
                <div className="mt-4 grid gap-4">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Amount
                    <input name="amount" type="number" step="0.01" min="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Method
                    <input name="method" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="ACH / Card / Check / Cash" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Reference
                    <input name="reference" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Receipt or transaction ID" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Notes
                    <textarea name="notes" rows={3} className="rounded-2xl border border-slate-300 px-4 py-3" />
                  </label>
                  <button className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white">Save payment</button>
                </div>
              </form>
            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Payments</p>
              <div className="mt-3 space-y-2">
                {invoice.payments.length > 0 ? invoice.payments.map((payment) => (
                  <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{payment.method}</p>
                      <p className="text-slate-600">{payment.receivedAt}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">{money(payment.amount)}</p>
                      <p className="text-slate-500">{payment.reference ?? "No reference"}</p>
                    </div>
                  </div>
                )) : <div className="rounded-2xl bg-white p-3 text-sm text-slate-600">No payments recorded yet.</div>}
              </div>
            </div>
          </article>
        )) : <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">No invoices yet.</div>}
      </div>
    </DashboardShell>
  );
}
