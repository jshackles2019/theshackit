import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { getClientContactById, getClientEstimatesByContactId, getClientInvoicesByContactId } from "@/lib/content";
import { money } from "@/lib/utils";

export default async function AdminViewAsClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const contact = await getClientContactById(clientId);

  if (!contact) {
    return (
      <DashboardShell title="Client Portal" description="Client not found.">
        <div className="rounded-3xl bg-white p-8 text-center text-slate-950 shadow-sm">
          <p className="text-slate-600">Unable to load client details.</p>
          <Link
            href="/dashboard/admin/clients"
            className="mt-4 inline-block rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to clients
          </Link>
        </div>
      </DashboardShell>
    );
  }

  // Load estimates and invoices with contact email
  const [estimatesData, invoicesData] = await Promise.all([
    getClientEstimatesByContactId(contact.email),
    getClientInvoicesByContactId(contact.email),
  ]);

  return (
    <DashboardShell
      title="Client Portal"
      description={`Viewing as: ${contact.fullName}`}
    >
      <div className="mb-4 flex items-center justify-between rounded-3xl bg-sky-50 p-4">
        <div>
          <p className="text-sm font-semibold text-sky-900">Admin View</p>
          <p className="text-sm text-sky-700">You are viewing this client&apos;s portal as an administrator.</p>
        </div>
        <Link
          href="/dashboard/admin/clients"
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Back to clients
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Client name</p>
          <p className="mt-3 text-lg font-semibold">{contact.fullName}</p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Estimate total</p>
          <p className="mt-3 text-2xl font-semibold">
            {estimatesData.length > 0 ? money(estimatesData.reduce((sum, est) => sum + est.totalSell, 0)) : "$0.00"}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Account balance</p>
          <p className="mt-3 text-2xl font-semibold">
            {invoicesData.length > 0
              ? money(invoicesData.reduce((sum, inv) => sum + inv.balanceDue, 0))
              : "$0.00"}
          </p>
        </article>
        <article className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">Billing</p>
          <p className="mt-3 text-sm text-slate-600">View their invoices and payment history.</p>
          <button className="mt-4 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white cursor-not-allowed opacity-50">
            Open invoices
          </button>
        </article>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold">Contact information</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div>
              <p className="text-slate-600">Email</p>
              <p className="font-semibold text-slate-900">{contact.email}</p>
            </div>
            {contact.companyName && (
              <div>
                <p className="text-slate-600">Company</p>
                <p className="font-semibold text-slate-900">{contact.companyName}</p>
              </div>
            )}
            <div>
              <p className="text-slate-600">Pipeline stage</p>
              <p className="font-semibold text-slate-900">{contact.pipelineStage}</p>
            </div>
            <div>
              <p className="text-slate-600">Status</p>
              <p className="font-semibold text-slate-900">{contact.status}</p>
            </div>
          </div>
        </article>
        <article className="rounded-3xl bg-slate-50 p-6">
          <h2 className="text-lg font-semibold">Service agreement</h2>
          <div className="mt-4 space-y-2 text-sm">
            {contact.agreement?.monthlyAmount ? (
              <>
                <div>
                  <p className="text-slate-600">Billing frequency</p>
                  <p className="font-semibold text-slate-900">{contact.agreement.billingFrequency ?? "Monthly"}</p>
                </div>
                <div>
                  <p className="text-slate-600">Monthly amount</p>
                  <p className="font-semibold text-slate-900">{money(contact.agreement.monthlyAmount)}</p>
                </div>
                {contact.agreement.includedServices && (
                  <div>
                    <p className="text-slate-600">Included services</p>
                    <p className="font-semibold text-slate-900">{contact.agreement.includedServices}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-600">No active service agreement</p>
            )}
          </div>
        </article>
      </div>

      <article className="mt-8 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Finalized estimates</h2>
        <div className="mt-4 space-y-3">
          {estimatesData.length > 0 ? (
            estimatesData.map((estimate) => (
              <div key={estimate.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{estimate.estimateNumber}</p>
                    <p className="text-sm text-slate-600">{estimate.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(estimate.totalSell)}</p>
                    <p className="text-xs text-slate-500">{estimate.status}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
              No finalized estimates are available for this client.
            </div>
          )}
        </div>
      </article>

      <article className="mt-8 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Recent invoices</h2>
        <div className="mt-4 space-y-3">
          {invoicesData.length > 0 ? (
            invoicesData.map((invoice) => (
              <div key={invoice.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-slate-600">{invoice.title}</p>
                    {invoice.dueDate && (
                      <p className="text-xs text-slate-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{money(invoice.total)}</p>
                    <p className="text-xs text-slate-500">{invoice.status}</p>
                  </div>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="mt-2 border-t border-slate-200 pt-2">
                    <p className="text-xs text-slate-600">Balance due: {money(invoice.balanceDue)}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-600">
              No invoices are available for this client.
            </div>
          )}
        </div>
      </article>
    </DashboardShell>
  );
}
