"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadAdminSupportTickets } from "@/app/actions";

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

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TicketPriority | "all">("all");

  useEffect(() => {
    const loadTickets = async () => {
      setLoading(true);
      const data = await loadAdminSupportTickets();
      setTickets(data || []);
      setLoading(false);
    };

    loadTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus !== "all" && ticket.status !== filterStatus) return false;
    if (filterPriority !== "all" && ticket.priority !== filterPriority) return false;
    return true;
  });

  const priorityBgColor = (priority: TicketPriority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "low": return "bg-green-100 text-green-800";
    }
  };

  const statusBgColor = (status: TicketStatus) => {
    switch (status) {
      case "open": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "on_hold": return "bg-orange-100 text-orange-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "closed": return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
          <p className="text-gray-600 mt-2">
            Manage customer support requests and track resolutions
          </p>
        </div>
        <Link href="/dashboard/admin/tickets/new">
          <button className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            + New Ticket
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Filter by Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "all")} className="w-full rounded-2xl border border-slate-300 px-4 py-2">
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Filter by Priority</label>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as TicketPriority | "all")} className="w-full rounded-2xl border border-slate-300 px-4 py-2">
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Link key={ticket.id} href={`/dashboard/admin/tickets/${ticket.id}`}>
              <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="mb-3">
                  <h3 className="font-semibold text-lg truncate">{ticket.subject}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {ticket.contactName} ({ticket.contactEmail})
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${priorityBgColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusBgColor(ticket.status)}`}>
                    {ticket.status.replace("_", " ").toUpperCase()}
                  </span>
                  {ticket.assignedToAdminName && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      Assigned to {ticket.assignedToAdminName}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {ticket.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>{ticket.replyCount} replies</span>
                  <span>
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
