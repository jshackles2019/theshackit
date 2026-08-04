"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadSupportTicketById, updateTicketStatusAction, addTicketReplyAction } from "@/app/actions";

type TicketStatus = "open" | "in_progress" | "on_hold" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

type SupportTicket = {
  id: string;
  contactId: string;
  contactName: string | null;
  contactEmail: string | null;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "on_hold" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedToAdminId: string | null;
  assignedToAdminName: string | null;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  source: "dashboard" | "email";
  replies: any[];
  replyCount: number;
};

const buttonClassName =
  "inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60";
const inputClassName =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none";
const labelClassName = "block text-sm font-medium text-slate-700";

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<TicketPriority | "">("");
  const [message, setMessage] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      const data = await loadSupportTicketById(params.ticketId);
      if (data) {
        setTicket(data);
        setStatus(data.status);
        setPriority(data.priority);
      }
      setLoading(false);
    };

    loadTicket();
  }, [params.ticketId]);

  const handleUpdateStatus = async () => {
    if (!ticket || !status || !priority) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("ticketId", ticket.id);
    formData.append("status", status);
    formData.append("priority", priority);
    formData.append("redirectTo", `/dashboard/admin/tickets/${ticket.id}`);

    try {
      await updateTicketStatusAction(formData);
      const updated = await loadSupportTicketById(params.ticketId);
      if (updated) setTicket(updated);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReply = async () => {
    if (!ticket || !message.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("ticketId", ticket.id);
    formData.append("message", message);
    if (isInternalNote) {
      formData.append("isInternalNote", "on");
    }
    formData.append("redirectTo", `/dashboard/admin/tickets/${ticket.id}`);

    try {
      await addTicketReplyAction(formData);
      setMessage("");
      setIsInternalNote(false);
      const updated = await loadSupportTicketById(params.ticketId);
      if (updated) setTicket(updated);
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: TicketStatus) => {
    switch (s) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-orange-100 text-orange-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
    }
  };

  const priorityColor = (p: TicketPriority) => {
    switch (p) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-slate-100 text-slate-700";
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-500">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/tickets" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:underline">
        <span aria-hidden="true">←</span>
        Back to Tickets
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-slate-200 p-6">
            <h1 className="mb-2 text-2xl font-bold">{ticket.subject}</h1>
            <p className="mb-4 text-slate-500">
              {ticket.contactName} ({ticket.contactEmail})
            </p>

            <div className="mb-6 rounded-md bg-slate-50 p-4">
              <p className="whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityColor(ticket.priority)}`}>
                {ticket.priority.toUpperCase()}
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(ticket.status)}`}>
                {ticket.status.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-500">
              <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
              {ticket.resolvedAt && <p>Resolved: {new Date(ticket.resolvedAt).toLocaleString()}</p>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-6">
            <h2 className="mb-4 text-lg font-semibold">Replies ({ticket.replyCount})</h2>

            <div className="mb-6 space-y-4">
              {ticket.replies.length === 0 ? (
                <p className="text-sm text-slate-500">No replies yet</p>
              ) : (
                ticket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`rounded border border-slate-200 p-4 ${reply.isInternalNote ? "bg-yellow-50" : "bg-white"}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{reply.userName || "Unknown User"}</p>
                        <p className="text-xs text-slate-500">{new Date(reply.createdAt).toLocaleString()}</p>
                      </div>
                      {reply.isInternalNote && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Internal Note
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-slate-700">{reply.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-6">
              <div>
                <label htmlFor="reply-message" className={`${labelClassName} mb-2 block`}>
                  Add Reply
                </label>
                <textarea
                  id="reply-message"
                  placeholder="Write a reply or internal note..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClassName} min-h-24`}
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-slate-300"
                  />
                  <span>Internal note (not visible to client)</span>
                </label>
              </div>

              <button type="button" onClick={handleAddReply} disabled={!message.trim() || submitting} className={`${buttonClassName} w-full gap-2`}>
                <span aria-hidden="true">↩</span>
                {submitting ? "Adding..." : "Add Reply"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 p-6">
            <h3 className="mb-4 font-semibold">Update Ticket</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="status" className={`${labelClassName} mb-2 block`}>
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TicketStatus)}
                  className={inputClassName}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className={`${labelClassName} mb-2 block`}>
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className={inputClassName}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <button type="button" onClick={handleUpdateStatus} disabled={submitting} className={`${buttonClassName} w-full`}>
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 p-6">
            <h3 className="mb-2 font-semibold">Ticket Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500">ID</p>
                <p className="break-all font-mono text-xs">{ticket.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Source</p>
                <p className="capitalize">{ticket.source}</p>
              </div>
              {ticket.assignedToAdminName && (
                <div>
                  <p className="text-slate-500">Assigned To</p>
                  <p>{ticket.assignedToAdminName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
