import { saveHardwareAction, saveServiceAction, saveSiteSettingAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { hardwareOfferings, services } from "@/lib/site";

export default function AdminServicesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  return (
    <DashboardShell
      title="Service and website management"
      description="Edit service offerings, catalog items, and core website copy from the app."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveServiceAction} className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <h2 className="text-lg font-semibold">Add or update a service</h2>
          <div className="mt-4 grid gap-4">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input name="name" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea name="description" rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Pricing model
              <input name="pricingModel" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Fixed / Hourly / Tiered" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Base price
                <input name="basePrice" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Internal cost
                <input name="internalCost" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Save service</button>
          </div>
        </form>

        <form action={saveHardwareAction} className="rounded-3xl bg-sky-50 p-6 text-slate-950">
          <h2 className="text-lg font-semibold">Add or update hardware</h2>
          <div className="mt-4 grid gap-4">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input name="name" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea name="description" rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Internal cost
                <input name="internalCost" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Sell price
                <input name="sellPrice" type="number" step="0.01" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <button className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">Save hardware</button>
          </div>
        </form>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Seeded services</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {services.map((service) => (
              <li key={service.name} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold text-slate-950">{service.name}</div>
                <div>{service.description}</div>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Hardware catalog preview</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {hardwareOfferings.map((item) => (
              <li key={item} className="rounded-2xl bg-slate-50 p-4">
                {item}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <form action={saveSiteSettingAction} className="mt-6 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Website copy</h2>
        <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Setting key
            <input name="key" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="hero_headline" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Value
            <input name="value" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="The Shack - IT Services You Can Trust" />
          </label>
        </div>
        <button className="mt-4 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Save copy</button>
      </form>
    </DashboardShell>
  );
}
