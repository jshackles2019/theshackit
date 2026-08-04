import Link from "next/link";
import { DashboardShell } from "@/components/dashboard-shell";
import { getAdminCrmContacts } from "@/lib/content";

export default async function AdminClientsPage() {
  const contacts = await getAdminCrmContacts();

  return (
    <DashboardShell
      title="Client Portal"
      description="View all your current clients and access their portal to verify how it appears for them."
    >
      <div className="space-y-4">
        {contacts.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-slate-950 shadow-sm">
            <p className="text-slate-600">No clients found yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between rounded-3xl bg-white p-6 text-slate-950 shadow-sm"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold">{contact.fullName}</h3>
                      <p className="text-sm text-slate-600">{contact.email}</p>
                      {contact.companyName && (
                        <p className="text-sm text-slate-500">{contact.companyName}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {contact.pipelineStage}
                    </span>
                    <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700">
                      {contact.status}
                    </span>
                  </div>
                  {contact.agreement?.monthlyAmount && (
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="font-semibold text-slate-900">${contact.agreement.monthlyAmount}/mo</span>
                      {contact.agreement.billingFrequency && (
                        <span> • {contact.agreement.billingFrequency}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/dashboard/admin/clients/${contact.id}/view`}
                    className="rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
                  >
                    View as client
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
