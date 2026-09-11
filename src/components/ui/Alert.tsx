type Tone = "info" | "success" | "error" | "warning";

const toneClasses: Record<Tone, string> = {
  info: "bg-navy-50 text-navy-800 border-navy-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  error: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-accent-50 text-accent-800 border-accent-200",
};

export function Alert({ tone = "info", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${toneClasses[tone]}`}>
      {children}
    </div>
  );
}
