import { useId } from "react";
import { cn } from "@/lib/utils";

type TextAreaFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  maxLength?: number;
  rows?: number;
};

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder,
  helperText,
  maxLength,
  rows = 4,
}: TextAreaFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-950">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-accent-600">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-steel-600">optional</span>
        )}
      </label>
      {helperText ? (
        <p id={helperId} className="mt-1 text-xs text-steel-600">
          {helperText}
        </p>
      ) : null}
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [helperText && helperId, error && errorId].filter(Boolean).join(" ") || undefined
        }
        className={cn(
          "mt-2 w-full resize-y rounded border bg-white px-4 py-3 text-base text-ink-950 placeholder:text-steel-600 transition-colors duration-micro ease-confident focus:outline-none focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/30",
          error ? "border-error" : "border-steel-300",
        )}
      />
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
