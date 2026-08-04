import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { getPublicSiteContent } from "@/lib/content";

export default async function AboutPage() {
  const content = await getPublicSiteContent();

  return (
    <Container className="py-16">
      <SectionHeading eyebrow="About" title="Built to feel dependable, modern, and easy to trust" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl bg-slate-50 p-8">
          <p className="text-base leading-8 text-slate-700">{content.aboutSummary}</p>
        </article>
        <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold">What drives the company</h2>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-700">
            {content.whyChooseUs.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>
      </div>
    </Container>
  );
}
