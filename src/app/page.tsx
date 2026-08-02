import Link from "next/link";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { aboutSummary, company, hero, hardwareOfferings, pricingApproach, services, whyChooseUs } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <section className="bg-slate-950 text-white">
        <Container className="grid gap-12 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Seguin • New Braunfels • San Marcos • Remote</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">{hero.subheadline}</p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">{company.tone}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="w-full rounded-full bg-sky-500 px-6 py-4 text-center text-base font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400 sm:w-auto sm:py-3 sm:text-sm">
                Book a consultation
              </Link>
              <Link href="/services" className="w-full rounded-full border border-white/20 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:py-3 sm:text-sm">
                Explore services
              </Link>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/auth/sign-up" className="w-full rounded-full bg-white px-6 py-4 text-center text-base font-semibold text-slate-950 shadow-lg shadow-slate-950/20 transition hover:bg-slate-100 sm:w-auto sm:py-3 sm:text-sm">
                Create account
              </Link>
              <Link href="/auth/sign-in" className="w-full rounded-full border border-white/20 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:py-3 sm:text-sm">
                Sign in
              </Link>
            </div>
            <div className="mt-5 grid gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 sm:hidden">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">Client access</p>
              <p className="text-sm leading-6 text-slate-300">
                Sign up to access the client portal and secure follow-up workflows.
              </p>
              <Link href="/auth/sign-up" className="rounded-full bg-sky-500 px-6 py-4 text-center text-base font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400">
                Create account
              </Link>
              <Link href="/auth/sign-in" className="rounded-full border border-white/20 px-6 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10">
                Sign in
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-sky-950/30 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">Built for trust and security</p>
            <ul className="mt-6 space-y-4 text-sm leading-6 text-slate-200">
              <li>• Consultation-led IT support</li>
              <li>• Admin-managed CRM and client portal</li>
              <li>• Client-safe estimate visibility</li>
              <li>• Scalable Supabase + RLS architecture</li>
            </ul>
            <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm font-semibold text-white">Client access</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Create an account to access the client portal, estimate updates, and secure follow-up workflows.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link href="/auth/sign-up" className="w-full rounded-full bg-sky-500 px-5 py-4 text-center text-base font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400 sm:w-auto sm:py-2.5 sm:text-sm">
                  Sign up
                </Link>
                <Link href="/auth/sign-in" className="w-full rounded-full border border-white/15 px-5 py-4 text-center text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto sm:py-2.5 sm:text-sm">
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-20">
        <SectionHeading
          eyebrow="About"
          title="A local IT partner that grows with your business"
          description={aboutSummary}
        />
      </Container>

      <Container className="py-6">
        <SectionHeading eyebrow="Services" title="What we offer" />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-slate-950">{service.name}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
              <p className="mt-5 text-sm font-medium text-sky-700">{service.pricing}</p>
            </article>
          ))}
        </div>
      </Container>

      <Container className="py-20">
        <SectionHeading eyebrow="Why choose us" title="Why clients stay with The Shack" />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {whyChooseUs.map((point, index) => (
            <article key={point} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold text-sky-700">0{index + 1}</p>
              <p className="mt-3 text-base leading-7 text-slate-700">{point}</p>
            </article>
          ))}
        </div>
      </Container>

      <Container className="grid gap-6 py-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-sky-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-950">Hardware offerings</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            {hardwareOfferings.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-semibold">Pricing approach</h2>
          <div className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
            {pricingApproach.map((item) => (
              <p key={item.label}>
                <span className="font-semibold text-white">{item.label}:</span> {item.value}
              </p>
            ))}
          </div>
        </article>
      </Container>

      <Container className="py-20">
        <div className="rounded-3xl bg-slate-100 p-8 sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Ready for a more secure IT setup?</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Start with a consultation, then we’ll map the right support model for your environment, budget, and growth plan.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/book" className="rounded-full bg-slate-950 px-6 py-3 text-center font-semibold text-white transition hover:bg-slate-800">
              Schedule a consult
            </Link>
            <Link href="/auth/sign-up" className="rounded-full border border-slate-300 px-6 py-3 text-center font-semibold text-slate-950 transition hover:bg-white">
              Create an account
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
