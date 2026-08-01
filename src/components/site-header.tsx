import Link from "next/link";
import { Container } from "@/components/container";
import { company, navItems } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-white/10 bg-slate-950 text-white">
      <Container className={cn("flex items-center justify-between gap-6 py-5", compact && "py-4")}>
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-lg font-bold text-white shadow-lg shadow-sky-950/30">
            S
          </span>
          <span>
            <span className="block text-sm uppercase tracking-[0.3em] text-sky-200/80">The Shack</span>
            <span className="block text-lg font-semibold">{company.name}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-slate-200 transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book"
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
        >
          Book a consult
        </Link>
      </Container>
    </header>
  );
}
