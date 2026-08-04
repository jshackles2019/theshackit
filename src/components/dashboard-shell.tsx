import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAction } from "@/app/actions";
import { Container } from "@/components/container";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/admin", label: "Admin" },
  { href: "/dashboard/admin/services", label: "Services" },
  { href: "/dashboard/admin/crm", label: "CRM" },
  { href: "/dashboard/admin/clients", label: "Clients" },
  { href: "/dashboard/admin/estimates", label: "Estimates" },
  { href: "/dashboard/admin/invoices", label: "Invoices" },
  { href: "/dashboard/client", label: "Client" },
  { href: "/dashboard/client/estimates", label: "Client estimates" },
  { href: "/dashboard/client/invoices", label: "Client invoices" },
];

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-10">
      <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/20">
        <div className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-300">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
            {description ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{description}</p> : null}
          </div>
          <form action={signOutAction}>
            <button type="submit" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950">
              Sign out
            </button>
          </form>
        </div>
        <nav className="mt-5 flex flex-wrap gap-3 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("rounded-full border border-white/10 px-4 py-2 text-slate-200 hover:bg-white/10")}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-8">{children}</div>
    </Container>
  );
}
