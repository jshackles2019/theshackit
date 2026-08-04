"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { loadSupportTicketById } from "@/app/actions";
import { addTicketReplyAction } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";

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

export default function ClientTicketDetailPage({ params }: { params: { ticketId: string } }) {
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      setLoading(true);
      const data = await loadSupportTicketById(params.ticketId);
      if (data) {
        setTicket(data);
      }
      setLoading(false);
    };

    loadTicket();
  }, [params.ticketId]);

  const handleAddReply = async () => {
    if (!ticket || !message.trim()) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append("ticketId", ticket.id);
    formData.append("message", message);
    formData.append("redirectTo", `/dashboard/client/tickets/${ticket.id}`);

    try {
      await addTicketReplyAction(formData);
      setMessage("");
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
    <div className="space-y-6 max-w-2xl">
      <Link href="/dashboard/client/tickets" className="inline-flex items-center gap-2 text-sm hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>

      <div className="border rounded-lg p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>

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

        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">Replies ({ticket.replyCount})</h2>

          <div className="space-y-4 mb-6">
            {ticket.replies.length === 0 ? (
              <p className="text-muted-foreground text-sm">No replies yet</p>
            ) : (
              ticket.replies.map((reply) => (
                <div key={reply.id} className="border rounded p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{reply.userName || "Support Team"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reply.createdAt).toLocaleString()}
                      </p>
                    </div>
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
                placeholder="Write a reply to the support team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-24"
                disabled={submitting}
              />
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
    </div>
  );
}
