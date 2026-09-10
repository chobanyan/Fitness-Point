import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? "checkbox";
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="flex cursor-pointer items-start gap-2.5 text-sm text-navy-800">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={`mt-0.5 h-4 w-4 shrink-0 rounded border-navy-300 text-navy-700 focus:ring-navy-400 ${className}`}
            aria-invalid={!!error}
            {...props}
          />
          <span>{label}</span>
        </label>
        {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
