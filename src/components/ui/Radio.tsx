import { InputHTMLAttributes, forwardRef } from "react";

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(({ label, id, className = "", ...props }, ref) => {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label
      htmlFor={inputId}
      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-navy-200 px-3.5 py-2.5 text-sm text-navy-800 transition-colors has-[:checked]:border-navy-600 has-[:checked]:bg-navy-50"
    >
      <input
        ref={ref}
        type="radio"
        id={inputId}
        className={`h-4 w-4 border-navy-300 text-navy-700 focus:ring-navy-400 ${className}`}
        {...props}
      />
      {label}
    </label>
  );
});
Radio.displayName = "Radio";
