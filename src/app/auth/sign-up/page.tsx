import { signUpAction } from "@/app/actions";
import { Container } from "@/components/container";
import { StatusBanner } from "@/components/status-banner";
import { SectionHeading } from "@/components/section-heading";

export default function SignUpPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Auth"
        title="Create a basic account"
        description="Guest consultation requests are not allowed. Sign up first, then continue into the booking flow."
      />
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />

      <form action={signUpAction} className="mt-10 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Full name
            <input name="fullName" required className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input name="email" type="email" required className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input name="password" type="password" minLength={8} required className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <button type="submit" className="rounded-full bg-sky-500 px-5 py-3 font-semibold text-white">
            Create account
          </button>
        </div>
      </form>
    </Container>
  );
}
