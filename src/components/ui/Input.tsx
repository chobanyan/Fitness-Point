import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-navy-800">
          {label}
          {props.required && <span className="text-accent-500"> *</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`rounded-xl border px-3.5 py-2.5 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-navy-500 focus:ring-2 focus:ring-navy-100 ${
            error ? "border-red-500" : "border-navy-200"
          } ${className}`}
          aria-invalid={!!error}
          {...props}
        />
        {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
