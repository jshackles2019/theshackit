import { deleteHardwareAction, deleteServiceAction, saveHardwareAction, saveServiceAction, saveSiteSettingAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getAdminCatalogContent } from "@/lib/content";
import { AdminServicesPageClient } from "./page-client";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const catalog = await getAdminCatalogContent();

  return (
    <DashboardShell
      title="Service and website management"
      description="Edit service offerings, catalog items, and core website copy from the app."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <AdminServicesPageClient catalog={catalog} />
      <section className="mt-6 rounded-3xl bg-slate-50 p-6">
        <h2 className="text-lg font-semibold">Website copy</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use the quick fields for contact and booking details, then use the generic editor for hero, about, and other copy.
        </p>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <form action={saveSiteSettingAction} className="rounded-2xl bg-white p-4 shadow-sm">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <input type="hidden" name="key" value="contact_email" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contact email
              <input name="value" type="email" placeholder="hello@example.com" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button className="mt-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save email</button>
          </form>
          <form action={saveSiteSettingAction} className="rounded-2xl bg-white p-4 shadow-sm">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <input type="hidden" name="key" value="contact_phone" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contact phone
              <input name="value" type="tel" placeholder="(210) 555-0123" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button className="mt-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save phone</button>
          </form>
          <form action={saveSiteSettingAction} className="rounded-2xl bg-white p-4 shadow-sm">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <input type="hidden" name="key" value="service_area" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Service area
              <input name="value" placeholder="Seguin, New Braunfels, San Marcos, Remote" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button className="mt-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save service area</button>
          </form>
          <form action={saveSiteSettingAction} className="rounded-2xl bg-white p-4 shadow-sm">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <input type="hidden" name="key" value="booking_url" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Booking URL
              <input name="value" type="url" placeholder="https://calendly.com/..." className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button className="mt-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save booking link</button>
          </form>
        </div>
        <form action={saveSiteSettingAction} className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
          <div className="grid gap-4 lg:grid-cols-2">
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
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <form action={saveSiteSettingAction} className="rounded-2xl bg-white p-4 shadow-sm">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <input type="hidden" name="key" value="why_choose_us" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Why choose us
              <textarea
                name="value"
                rows={5}
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder={"One point per line\nKeep it client-friendly"}
              />
            </label>
            <button className="mt-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save bullets</button>
          </form>
          <form action={saveSiteSettingAction} className="rounded-2xl bg-white p-4 shadow-sm">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <input type="hidden" name="key" value="optional_services" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Optional services
              <textarea
                name="value"
                rows={5}
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder={"One service per line\nThese appear on the public services page"}
              />
            </label>
            <button className="mt-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save list</button>
          </form>
          <form action={saveSiteSettingAction} className="rounded-2xl bg-white p-4 shadow-sm">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <input type="hidden" name="key" value="pricing_approach" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Pricing approach
              <textarea
                name="value"
                rows={5}
                className="rounded-2xl border border-slate-300 px-4 py-3"
                placeholder={"Services: Fixed / Hourly / Tiered\nHardware: Quote-based\nClient visibility: Sell price only"}
              />
            </label>
            <button className="mt-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Save approach</button>
          </form>
        </div>
      </section>
    </DashboardShell>
  );
}
