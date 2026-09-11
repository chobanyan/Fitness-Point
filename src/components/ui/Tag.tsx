type Tone = "neutral" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-navy-100 text-navy-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-accent-100 text-accent-700",
  danger: "bg-red-100 text-red-700",
};

export function Tag({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}
