import { addCrmActivityAction, createCrmTaskAction, deleteContactAction, saveContactAction, updateCrmTaskAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getAdminCrmContacts, getAdminCrmTasks } from "@/lib/content";
import { AdminCrmPageClient } from "./page-client";

export default async function AdminCrmPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const [contacts, tasks] = await Promise.all([getAdminCrmContacts(), getAdminCrmTasks()]);

  return (
    <DashboardShell
      title="CRM workspace"
      description="Track leads, prospects, clients, notes, tasks, follow-ups, and pipeline stages."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <AdminCrmPageClient contacts={contacts} tasks={tasks} />
    </DashboardShell>
  );
}
