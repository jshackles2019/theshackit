"use client";

import Link from "next/link";
import { Container } from "@/components/container";
import { company, navItems } from "@/lib/site";

interface SiteHeaderClientProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
}

export function SiteHeaderClient({ isAuthenticated, isAdmin, isClient }: SiteHeaderClientProps) {
  return (
    <header className="border-b border-white/10 bg-slate-950 text-white">
      <Container className="flex items-center justify-between gap-6 py-5">
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
          {isAuthenticated && (
            <>
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className="text-sm font-semibold text-sky-200 transition hover:text-sky-100"
                >
                  Admin
                </Link>
              )}
              {isClient && (
                <Link
                  href="/dashboard/client"
                  className="text-sm font-semibold text-sky-200 transition hover:text-sky-100"
                >
                  Client Portal
                </Link>
              )}
            </>
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!isAuthenticated ? (
            <>
              <Link
                href="/auth/sign-in"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                href="/auth/sign-up"
                className="rounded-full border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25"
              >
                Create account
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="rounded-full border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25"
            >
              Dashboard
            </Link>
          )}
          <Link
            href="/book"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
          >
            Book a consult
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!isAuthenticated && (
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-950/20 transition hover:bg-sky-400"
            >
              Join
            </Link>
          )}
          <Link
            href="/book"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-100"
          >
            Book
          </Link>
        </div>
      </Container>
    </header>
  );
}
