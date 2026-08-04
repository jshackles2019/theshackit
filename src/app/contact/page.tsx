import { Container } from "@/components/container";
import { StatusBanner } from "@/components/status-banner";
import { SectionHeading } from "@/components/section-heading";
import { submitLeadAction } from "@/app/actions";
import { getPublicContactContent } from "@/lib/content";
import Link from "next/link";

export default async function ContactPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  const contact = await getPublicContactContent();

  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Reach out for support, projects, or a consultation"
        description="Use the form below, book a consultation, or reach out directly using the live contact details on this page."
      />
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <form action={submitLeadAction} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <input type="hidden" name="redirectTo" value="/contact" />
          <h2 className="text-xl font-semibold">Send a message</h2>
          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Name
              <input name="name" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Email
              <input name="email" type="email" required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Company
              <input name="companyName" className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Message
              <textarea name="message" rows={5} required className="rounded-2xl border border-slate-300 px-4 py-3" />
            </label>
            <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              Send message
            </button>
          </div>
        </form>
        <article className="rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-xl font-semibold">Direct contact</h2>
          <div className="mt-5 grid gap-4 text-sm leading-6 text-slate-300">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Email</p>
              {contact.email.startsWith("Use the form") ? (
                <p className="mt-2">{contact.email}</p>
              ) : (
                <a href={`mailto:${contact.email}`} className="mt-2 inline-block text-white underline decoration-sky-300 decoration-2 underline-offset-4">
                  {contact.email}
                </a>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Phone</p>
              {contact.phone.startsWith("Shared after") ? (
                <p className="mt-2">{contact.phone}</p>
              ) : (
                <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`} className="mt-2 inline-block text-white underline decoration-sky-300 decoration-2 underline-offset-4">
                  {contact.phone}
                </a>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Service area</p>
              <p className="mt-2">{contact.serviceArea.join(", ")}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">Booking</p>
              <Link href={contact.bookingUrl} className="mt-2 inline-block text-white underline decoration-sky-300 decoration-2 underline-offset-4" target="_blank" rel="noreferrer">
                Schedule time online
              </Link>
            </div>
          </div>
        </article>
      </div>
    </Container>
  );
}
