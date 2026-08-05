import { addCrmActivityAction, createCrmTaskAction, deleteContactAction, saveContactAction, updateCrmTaskAction } from "@/app/actions";
import { DashboardShell } from "@/components/dashboard-shell";
import { StatusBanner } from "@/components/status-banner";
import { getAdminCrmContacts, getAdminCrmTasks } from "@/lib/content";
import { crmStages } from "@/lib/site";

function contactSourceLabel(source: string | null) {
  switch (source) {
    case "auth_signup":
      return "Signup";
    case "auth_signup_backfill":
      return "Signup import";
    case "contact_form":
      return "Lead form";
    case "booking_page":
      return "Booking";
    case "admin":
      return "Manual";
    default:
      return source ?? "Unknown";
  }
}

export default async function AdminCrmPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string; editContactId?: string };
}) {
  const [contacts, tasks] = await Promise.all([getAdminCrmContacts(), getAdminCrmTasks()]);
  const editingContact = contacts.find((contact) => contact.id === searchParams?.editContactId) ?? null;

  return (
    <DashboardShell
      title="CRM workspace"
      description="Track leads, prospects, clients, notes, tasks, follow-ups, and pipeline stages."
    >
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveContactAction} className="rounded-3xl bg-white p-6 text-slate-950 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{editingContact ? "Edit contact" : "Create or update a contact"}</h2>
            {editingContact ? (
              <a href="/dashboard/admin/crm" className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                Cancel edit
              </a>
            ) : null}
          </div>
          <input type="hidden" name="redirectTo" value="/dashboard/admin/crm" />
          {editingContact ? <input type="hidden" name="contactId" value={editingContact.id} /> : null}
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Full name
              <input name="fullName" required defaultValue={editingContact?.fullName ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input name="email" type="email" required defaultValue={editingContact?.email ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Company
              <input name="companyName" defaultValue={editingContact?.companyName ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Pipeline stage
              <select name="pipelineStage" defaultValue={editingContact?.pipelineStage ?? "Lead"} className="rounded-2xl border border-slate-300 px-4 py-3">
                {crmStages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select name="status" defaultValue={editingContact?.status ?? "lead"} className="rounded-2xl border border-slate-300 px-4 py-3">
                <option value="lead">Lead</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Active
              <select
                name="active"
                defaultValue={editingContact ? (editingContact.active ? "active" : "inactive") : "active"}
                className="rounded-2xl border border-slate-300 px-4 py-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Notes
              <textarea name="notes" rows={4} defaultValue={editingContact?.notes ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Billing frequency
                <input name="billingFrequency" defaultValue={editingContact?.agreement?.billingFrequency ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Monthly" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Monthly amount
                <input name="monthlyAmount" type="number" step="0.01" defaultValue={editingContact?.agreement?.monthlyAmount ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                SLA start date
                <input name="slaStartDate" type="date" defaultValue={""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                SLA end date
                <input name="slaEndDate" type="date" defaultValue={""} className="rounded-2xl border border-slate-300 px-4 py-3" />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Included services
              <textarea name="includedServices" rows={3} defaultValue={editingContact?.agreement?.includedServices ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Help desk, patching, workstation support" />
            </label>
            <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">{editingContact ? "Update contact" : "Save contact"}</button>
            {editingContact ? (
              <p className="text-xs text-slate-500">
                This form edits the selected contact. Use the delete button on the contact card to remove it.
              </p>
            ) : null}
          </div>
        </form>

        <form action={addCrmActivityAction} className="rounded-3xl bg-sky-50 p-6 text-slate-950">
          <h2 className="text-lg font-semibold">Log activity</h2>
          <input type="hidden" name="redirectTo" value="/dashboard/admin/crm" />
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contact ID
              <input name="contactId" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="contact UUID" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Activity type
              <input name="activityType" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="note / task / follow-up" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Activity note
              <textarea name="note" rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Follow-up date
              <input name="followUpAt" type="date" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">Log activity</button>
          </div>
        </form>
      </div>

      <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">CRM tasks and reminders</h2>
        <p className="mt-2 text-sm text-slate-600">Create follow-ups, assign them to a person, and track due dates or reminders from one place.</p>
        <form action={createCrmTaskAction} className="mt-5 grid gap-4 rounded-2xl bg-slate-50 p-4">
          <input type="hidden" name="redirectTo" value="/dashboard/admin/crm" />
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Contact
              <select name="contactId" className="rounded-2xl border border-slate-300 px-4 py-3">
                <option value="">No contact linked</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.fullName} ({contact.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Assigned to
              <input name="assignedTo" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="John / Admin / Team member" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Title
            <input name="title" required className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Call back about proposal" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Notes
            <textarea name="notes" rows={3} className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Add context, next steps, or blockers." />
          </label>
          <div className="grid gap-4 lg:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select name="status" className="rounded-2xl border border-slate-300 px-4 py-3">
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Due date
              <input name="dueDate" type="date" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Reminder
              <input name="reminderAt" type="datetime-local" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
          </div>
          <button className="w-fit rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">Save task</button>
        </form>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {tasks.length > 0 ? tasks.map((task) => (
            <form key={task.id} action={updateCrmTaskAction} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <input type="hidden" name="redirectTo" value="/dashboard/admin/crm" />
              <input type="hidden" name="taskId" value={task.id} />
              <div className="grid gap-3">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950">{task.title}</p>
                      <p className="text-sm text-slate-600">
                        {task.contactName ?? "No contact linked"} • {task.assignedTo ?? "Unassigned"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      {task.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {task.dueDate ? `Due ${task.dueDate}` : "No due date"}{task.reminderAt ? ` • Reminder ${new Date(task.reminderAt).toLocaleString()}` : ""}
                  </p>
                  {task.notes ? <p className="mt-3 text-sm leading-6 text-slate-700">{task.notes}</p> : null}
                </div>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Contact
                  <select name="contactId" defaultValue={task.contactId ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3">
                    <option value="">No contact linked</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.fullName} ({contact.email})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Title
                  <input name="title" defaultValue={task.title} className="rounded-2xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Notes
                  <textarea name="notes" rows={3} defaultValue={task.notes ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                </label>
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Assigned to
                    <input name="assignedTo" defaultValue={task.assignedTo ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Status
                    <select name="status" defaultValue={task.status} className="rounded-2xl border border-slate-300 px-4 py-3">
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Due date
                    <input name="dueDate" type="date" defaultValue={task.dueDate ?? ""} className="rounded-2xl border border-slate-300 px-4 py-3" />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Reminder
                    <input
                      name="reminderAt"
                      type="datetime-local"
                      defaultValue={task.reminderAt ? task.reminderAt.slice(0, 16) : ""}
                      className="rounded-2xl border border-slate-300 px-4 py-3"
                    />
                  </label>
                </div>
                <button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Update task</button>
              </div>
            </form>
          )) : <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">No CRM tasks yet.</div>}
        </div>
      </section>

      <article className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Saved CRM contacts</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {contacts.length > 0 ? contacts.map((contact) => (
            <div key={contact.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold">{contact.fullName}</p>
              <p className="text-sm text-slate-600">{contact.companyName ?? "No company listed"}</p>
              <p className="mt-2 text-sm text-slate-600">
                {contact.pipelineStage} • {contact.status}
              </p>
              <p className="mt-2 text-sm text-slate-500">{contact.email}</p>
              {contact.agreement ? (
                <p className="mt-2 text-sm text-slate-600">
                  {contact.agreement.billingFrequency ?? "No billing frequency"} • {contact.agreement.includedServices ?? "No service agreement details"}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                  {contactSourceLabel(contact.source)}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  {contact.activityCount} activity item(s) • {contact.openTaskCount} open task(s)
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${contact.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                  {contact.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={`/dashboard/admin/crm?editContactId=${contact.id}`}
                  className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Edit
                </a>
                <form action={deleteContactAction} className="inline-flex">
                  <input type="hidden" name="redirectTo" value="/dashboard/admin/crm" />
                  <input type="hidden" name="contactId" value={contact.id} />
                  <button type="submit" className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-700">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          )) : <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No CRM contacts saved yet.</div>}
        </div>
      </article>
    </DashboardShell>
  );
}
