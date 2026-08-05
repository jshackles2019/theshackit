"use client";

import { deleteHardwareAction, deleteServiceAction, saveHardwareAction, saveServiceAction } from "@/app/actions";
import { getAdminCatalogContent } from "@/lib/content";
import { useState } from "react";

type AdminCatalogContent = Awaited<ReturnType<typeof getAdminCatalogContent>>;

export function AdminServicesPageClient({ catalog }: { catalog: AdminCatalogContent }) {
  const [editingService, setEditingService] = useState<AdminCatalogContent["services"][0] | null>(null);
  const [editingHardware, setEditingHardware] = useState<AdminCatalogContent["hardware"][0] | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showHardwareModal, setShowHardwareModal] = useState(false);

  const openServiceModal = (service: AdminCatalogContent["services"][0]) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const closeServiceModal = () => {
    setEditingService(null);
    setShowServiceModal(false);
  };

  const openHardwareModal = (item: AdminCatalogContent["hardware"][0]) => {
    setEditingHardware(item);
    setShowHardwareModal(true);
  };

  const closeHardwareModal = () => {
    setEditingHardware(null);
    setShowHardwareModal(false);
  };

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveServiceAction} className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <h2 className="text-lg font-semibold">Add or update a service</h2>
          <div className="mt-4 grid gap-4">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input name="name" required defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea name="description" rows={4} defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Pricing model
              <input name="pricingModel" defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Fixed / Hourly / Tiered" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Base price
                <input name="basePrice" type="number" step="0.01" defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Internal cost
                <input name="internalCost" type="number" step="0.01" defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select name="active" defaultValue="active" className="rounded-2xl border border-slate-300 px-4 py-3">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Save service</button>
          </div>
        </form>

        <form action={saveHardwareAction} className="rounded-3xl bg-sky-50 p-6 text-slate-950">
          <h2 className="text-lg font-semibold">Add or update hardware</h2>
          <div className="mt-4 grid gap-4">
            <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input name="name" required defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea name="description" rows={4} defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Internal cost
                <input name="internalCost" type="number" step="0.01" defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Sell price
                <input name="sellPrice" type="number" step="0.01" defaultValue="" className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select name="active" defaultValue="active" className="rounded-2xl border border-slate-300 px-4 py-3">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <button className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">Save hardware</button>
          </div>
        </form>
      </div>

      {/* Service Edit Modal */}
      {showServiceModal && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Edit service</h2>
              <button
                onClick={closeServiceModal}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form
              action={saveServiceAction}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveServiceAction(formData).then(() => closeServiceModal());
              }}
              className="grid gap-4"
            >
              <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
              <input type="hidden" name="serviceId" value={editingService.id} />

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Name
                <input name="name" required defaultValue={editingService.name} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea name="description" rows={4} defaultValue={editingService.description ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Pricing model
                <input name="pricingModel" defaultValue={editingService.pricingModel ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Fixed / Hourly / Tiered" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Base price
                  <input name="basePrice" type="number" step="0.01" defaultValue={editingService.basePrice ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Internal cost
                  <input name="internalCost" type="number" step="0.01" defaultValue={editingService.internalCost ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Status
                <select name="active" defaultValue={editingService.active ? "active" : "inactive"} className="rounded-2xl border border-slate-300 px-4 py-3">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div className="mt-6 flex gap-3">
                <button type="submit" className="flex-1 rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Update service</button>
                <button
                  type="button"
                  onClick={closeServiceModal}
                  className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              <form action={deleteServiceAction} className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-4">
                <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
                <input type="hidden" name="serviceId" value={editingService.id} />
                <p className="text-sm text-red-900 mb-3">This action cannot be undone.</p>
                <button className="w-full rounded-full border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-100">Delete service</button>
              </form>
            </form>
          </div>
        </div>
      )}

      {/* Hardware Edit Modal */}
      {showHardwareModal && editingHardware && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Edit hardware</h2>
              <button
                onClick={closeHardwareModal}
                className="rounded-full p-2 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form
              action={saveHardwareAction}
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveHardwareAction(formData).then(() => closeHardwareModal());
              }}
              className="grid gap-4"
            >
              <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
              <input type="hidden" name="hardwareId" value={editingHardware.id} />

              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Name
                <input name="name" required defaultValue={editingHardware.name} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Description
                <textarea name="description" rows={4} defaultValue={editingHardware.description ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Internal cost
                  <input name="internalCost" type="number" step="0.01" defaultValue={editingHardware.internalCost ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Sell price
                  <input name="sellPrice" type="number" step="0.01" defaultValue={editingHardware.sellPrice ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Status
                <select name="active" defaultValue={editingHardware.active ? "active" : "inactive"} className="rounded-2xl border border-slate-300 px-4 py-3">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>

              <div className="mt-6 flex gap-3">
                <button type="submit" className="flex-1 rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">Update hardware</button>
                <button
                  type="button"
                  onClick={closeHardwareModal}
                  className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>

              <form action={deleteHardwareAction} className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-4">
                <input type="hidden" name="redirectTo" value="/dashboard/admin/services" />
                <input type="hidden" name="hardwareId" value={editingHardware.id} />
                <p className="text-sm text-red-900 mb-3">This action cannot be undone.</p>
                <button className="w-full rounded-full border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-100">Delete hardware</button>
              </form>
            </form>
          </div>
        </div>
      )}

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
                  <button onClick={() => openServiceModal(service)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">Edit</button>
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
                  <button onClick={() => openHardwareModal(item)} className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">Edit</button>
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
    </>
  );
}
