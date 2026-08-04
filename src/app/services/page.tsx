import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { getPublicSiteContent } from "@/lib/content";

export default async function ServicesPage() {
  const content = await getPublicSiteContent();
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Services"
        title="Practical IT support with a security-first mindset"
        description="We help businesses buy smarter, support users faster, and modernize systems without overcomplicating the stack."
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {content.services.map((service) => (
          <article key={service.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">{service.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{service.description}</p>
            <p className="mt-5 text-sm font-medium text-sky-700">{service.pricing}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl bg-slate-950 p-8 text-white">
          <h2 className="text-2xl font-semibold">Hardware and product offerings</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
            {content.hardwareOfferings.map((item) => (
              <li key={item.name}>• {item.name}</li>
            ))}
          </ul>
        </article>
        <article className="rounded-3xl bg-sky-50 p-8">
          <h2 className="text-2xl font-semibold text-slate-950">How pricing works</h2>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            {content.pricingApproach.map((item) => (
              <li key={item.label}>
                <span className="font-semibold">{item.label}:</span> {item.value}
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <h2 className="text-2xl font-semibold">Optional services</h2>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
          {content.optionalServices.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </article>
    </Container>
  );
}
