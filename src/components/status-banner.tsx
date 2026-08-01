export function StatusBanner({
  success,
  error,
}: {
  success?: string;
  error?: string;
}) {
  if (success) {
    return <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{success}</div>;
  }

  if (error) {
    return <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div>;
  }

  return null;
}
