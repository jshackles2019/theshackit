import { addEstimateLineItemAction, createEstimateAction, deleteEstimateAction, finalizeEstimateAction, updateEstimateAction, updateEstimateLineItemAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getAdminEstimates } from "@/lib/content";
import { AdminEstimatesPageClient } from "./page-client";

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
      <AdminEstimatesPageClient estimates={estimates} />
    </DashboardShell>
  );
}
