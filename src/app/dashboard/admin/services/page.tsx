import { deleteHardwareAction, deleteServiceAction, saveHardwareAction, saveServiceAction, saveSiteSettingAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getAdminCatalogContent } from "@/lib/content";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string; editServiceId?: string; editHardwareId?: string };
}) {
  const catalog = await getAdminCatalogContent();
  const editingService = catalog.services.find((service) => service.id === searchParams?.editServiceId) ?? null;
  const editingHardware = catalog.hardware.find((item) => item.id === searchParams?.editHardwareId) ?? null;

  return (
    <DashboardShell
      title="Service and website management"
      description="Edit service offerings, catalog items, and core website copy from the app."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveServiceAction} className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <h2 className="text-lg font-semibold">{editingService ? "Edit service" : "Add or update a service"}</h2>
          <div className="mt-4 grid gap-4">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            {editingService ? <input type="hidden" name="serviceId" value={editingService.id} /> : null}
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input name="name" required defaultValue={editingService?.name ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea name="description" rows={4} defaultValue={editingService?.description ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Pricing model
              <input name="pricingModel" defaultValue={editingService?.pricingModel ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Fixed / Hourly / Tiered" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Base price
                <input name="basePrice" type="number" step="0.01" defaultValue={editingService?.basePrice ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Internal cost
                <input name="internalCost" type="number" step="0.01" defaultValue={editingService?.internalCost ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select name="active" defaultValue={editingService ? (editingService.active ? "active" : "inactive") : "active"} className="rounded-2xl border border-slate-300 px-4 py-3">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">{editingService ? "Update service" : "Save service"}</button>
            {editingService ? <p className="text-xs text-slate-500">Delete from the service list below.</p> : null}
          </div>
        </form>

        <form action={saveHardwareAction} className="rounded-3xl bg-sky-50 p-6 text-slate-950">
          <h2 className="text-lg font-semibold">{editingHardware ? "Edit hardware" : "Add or update hardware"}</h2>
          <div className="mt-4 grid gap-4">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            {editingHardware ? <input type="hidden" name="hardwareId" value={editingHardware.id} /> : null}
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input name="name" required defaultValue={editingHardware?.name ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea name="description" rows={4} defaultValue={editingHardware?.description ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Internal cost
                <input name="internalCost" type="number" step="0.01" defaultValue={editingHardware?.internalCost ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Sell price
                <input name="sellPrice" type="number" step="0.01" defaultValue={editingHardware?.sellPrice ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select name="active" defaultValue={editingHardware ? (editingHardware.active ? "active" : "inactive") : "active"} className="rounded-2xl border border-slate-300 px-4 py-3">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">{editingHardware ? "Update hardware" : "Save hardware"}</button>
            {editingHardware ? <p className="text-xs text-slate-500">Delete from the hardware list below.</p> : null}
          </div>
        </form>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Saved services</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {catalog.services.length > 0 ? catalog.services.map((service) => (
              <li key={service.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold text-slate-950">{service.name}</div>
                <div>{service.description}</div>
                {service.pricingModel ? <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{service.pricingModel}</div> : null}
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{service.active ? "Active" : "Inactive"}</div>
                <div className="mt-3 flex gap-2">
                  <a href={`/dashboard/admin/services?editServiceId=${service.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">Edit</a>
                  <form action={deleteServiceAction}>
                    <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
                    <input type="hidden" name="serviceId" value={service.id} />
                    <button className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700">Delete</button>
                  </form>
                </div>
              </li>
            )) : <li className="rounded-2xl bg-slate-50 p-4">No services saved yet.</li>}
          </ul>
        </article>
        <article className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Hardware catalog preview</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {catalog.hardware.length > 0 ? catalog.hardware.map((item) => (
              <li key={item.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="font-semibold text-slate-950">{item.name}</div>
                <div>{item.description}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">{item.active ? "Active" : "Inactive"}</div>
                <div className="mt-3 flex gap-2">
                  <a href={`/dashboard/admin/services?editHardwareId=${item.id}`} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">Edit</a>
                  <form action={deleteHardwareAction}>
                    <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
                    <input type="hidden" name="hardwareId" value={item.id} />
                    <button className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-700">Delete</button>
                  </form>
                </div>
              </li>
            )) : <li className="rounded-2xl bg-slate-50 p-4">No hardware saved yet.</li>}
          </ul>
        </article>
      </div>

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
