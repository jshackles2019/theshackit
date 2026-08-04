import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getClientInvoices } from "@/lib/content";
import { money } from "@/lib/utils";

export default async function ClientInvoicesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const invoices = await getClientInvoices();

  return (
    <DashboardShell
      title="Client invoices"
      description="Review your active invoices, totals, and payment history."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Invoices</p>
          <p className="mt-3 text-2xl font-semibold">{invoices.length}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Balance due</p>
          <p className="mt-3 text-2xl font-semibold">{money(invoices.reduce((sum, invoice) => sum + invoice.balanceDue, 0))}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Paid</p>
          <p className="mt-3 text-2xl font-semibold">{money(invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0))}</p>
        </article>
      </div>

      <div className="mt-6 space-y-4">
        {invoices.length > 0 ? invoices.map((invoice) => (
          <article key={invoice.id} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">{invoice.invoiceNumber}</p>
                <h2 className="mt-2 text-xl font-semibold">{invoice.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{invoice.status}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Due {invoice.dueDate ?? "TBD"} • {invoice.contactName ?? "No contact linked"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total {money(invoice.total)}</p>
                <p className="text-lg font-semibold text-slate-950">Balance {money(invoice.balanceDue)}</p>
              </div>
            </div>

            {invoice.notes ? <p className="mt-4 text-sm leading-6 text-slate-700">{invoice.notes}</p> : null}

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Payment history</p>
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
        )) : <div className="rounded-2xl bg-white p-4 text-sm text-slate-600 shadow-sm">No invoices are available for your account yet.</div>}
      </div>
    </DashboardShell>
  );
}
