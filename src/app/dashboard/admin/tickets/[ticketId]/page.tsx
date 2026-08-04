"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadSupportTicketById } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import { updateTicketStatusAction, addTicketReplyAction } from "@/app/actions";

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
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "default";
      case "low":
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading ticket...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/tickets" className="inline-flex items-center gap-2 text-sm hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="border rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
            <p className="text-muted-foreground mb-4">
              {ticket.contactName} ({ticket.contactEmail})
            </p>

            <div className="prose prose-sm max-w-none mb-6">
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <Badge variant={priorityColor(ticket.priority)}>
                {ticket.priority.toUpperCase()}
              </Badge>
              <div className={`px-2 py-1 rounded text-xs font-medium ${statusColor(ticket.status)}`}>
                {ticket.status.replace("_", " ").toUpperCase()}
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Created: {new Date(ticket.createdAt).toLocaleString()}</p>
              {ticket.resolvedAt && (
                <p>Resolved: {new Date(ticket.resolvedAt).toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Replies ({ticket.replyCount})</h2>

            <div className="space-y-4 mb-6">
              {ticket.replies.length === 0 ? (
                <p className="text-muted-foreground text-sm">No replies yet</p>
              ) : (
                ticket.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`border rounded p-4 ${
                      reply.isInternalNote ? "bg-yellow-50 border-yellow-200" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{reply.userName || "Unknown User"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {reply.isInternalNote && (
                        <Badge variant="secondary" className="text-xs">
                          Internal Note
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-6 space-y-4">
              <div>
                <Label htmlFor="reply-message" className="text-base font-semibold mb-2 block">
                  Add Reply
                </Label>
                <Textarea
                  id="reply-message"
                  placeholder="Write a reply or internal note..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-24"
                  disabled={submitting}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Internal note (not visible to client)</span>
                </label>
              </div>

              <Button
                onClick={handleAddReply}
                disabled={!message.trim() || submitting}
                className="w-full gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Adding..." : "Add Reply"}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Update Ticket</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status" className="text-sm mb-2 block">
                  Status
                </Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm mb-2 block">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleUpdateStatus}
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Ticket Info</h3>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">ID</p>
                <p className="font-mono text-xs break-all">{ticket.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Source</p>
                <p className="capitalize">{ticket.source}</p>
              </div>
              {ticket.assignedToAdminName && (
                <div>
                  <p className="text-muted-foreground">Assigned To</p>
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
