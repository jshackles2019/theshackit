import Link from "next/link";
import { requestConsultationAction } from "@/app/actions";
import { Container } from "@/components/container";
import { StatusBanner } from "@/components/status-banner";
import { SectionHeading } from "@/components/section-heading";
import { company } from "@/lib/site";

export default function BookPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Booking"
        title="Request a consultation, then book a slot that works for you"
        description="Guests should create an account before requesting a consultation. Once signed in, the request is recorded for follow-up and can route into Calendly."
      />
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />

      <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">Consultation request</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sign in first, then submit the request so the owner can respond and prepare the right next step.
          </p>
          <form action={requestConsultationAction} className="mt-6 grid gap-4">
            <input type="hidden" name="redirectTo" value="/book" />
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Topic
              <input name="topic" required className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Managed IT review" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Preferred time
              <input name="preferredTime" className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Weekday afternoons" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Notes
              <textarea name="notes" rows={4} className="rounded-2xl border border-slate-300 px-4 py-3" placeholder="Tell us what is going on." />
            </label>
            <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
              Submit request
            </button>
          </form>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/sign-up" className="rounded-full bg-sky-500 px-5 py-3 text-center font-semibold text-white">
              Create an account
            </Link>
            <Link href="/auth/sign-in" className="rounded-full border border-slate-300 px-5 py-3 text-center font-semibold text-slate-950">
              Sign in
            </Link>
          </div>
        </article>

        <article className="rounded-3xl bg-sky-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-800">Calendly</p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-950">Schedule with The Shack</h2>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            The booking flow is wired to the {company.bookingUrl} link for your MVP launch.
          </p>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <iframe
              title="Calendly booking"
              src={company.bookingUrl}
              className="min-h-[720px] w-full"
              loading="lazy"
            />
          </div>
        </article>
      </div>
    </Container>
  );
}
