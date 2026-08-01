import Link from "next/link";
import { Container } from "@/components/container";
import { company } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <Container className="py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">{company.name}</p>
            <p className="mt-2 text-sm text-slate-600">
              Production-minded IT services for Seguin, New Braunfels, San Marcos, and remote clients.
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/services" className="text-slate-600 hover:text-slate-950">
              Services
            </Link>
            <Link href="/contact" className="text-slate-600 hover:text-slate-950">
              Contact
            </Link>
            <Link href="/auth/sign-in" className="text-slate-600 hover:text-slate-950">
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
