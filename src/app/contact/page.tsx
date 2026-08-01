import { Container } from "@/components/container";
import { StatusBanner } from "@/components/status-banner";
import { SectionHeading } from "@/components/section-heading";
import { submitLeadAction } from "@/app/actions";

export default function ContactPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Reach out for support, projects, or a consultation"
        description="Primary business email and phone are coming soon. In the meantime, use the booking flow or your account portal to start a request."
      />
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
          <p className="mt-4 text-sm leading-6 text-slate-300">Email: COMING SOON</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">Phone: COMING SOON</p>
          <p className="mt-6 text-sm leading-6 text-slate-300">Service area: Seguin, New Braunfels, San Marcos, and remote.</p>
        </article>
      </div>
    </Container>
  );
}
