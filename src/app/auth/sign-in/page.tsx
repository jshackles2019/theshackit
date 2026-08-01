import { signInAction } from "@/app/actions";
import { Container } from "@/components/container";
import { StatusBanner } from "@/components/status-banner";
import { SectionHeading } from "@/components/section-heading";

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { success?: string; error?: string };
}) {
  return (
    <Container className="py-16">
      <SectionHeading
        eyebrow="Auth"
        title="Sign in to your account"
        description="Basic accounts are open to anyone. Client access is assigned by an admin."
      />
      <StatusBanner success={searchParams?.success} error={searchParams?.error} />

      <form action={signInAction} className="mt-10 max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Email
            <input name="email" type="email" required className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Password
            <input name="password" type="password" required className="rounded-2xl border border-slate-300 px-4 py-3" />
          </label>
          <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 font-semibold text-white">
            Sign in
          </button>
        </div>
      </form>
    </Container>
  );
}
