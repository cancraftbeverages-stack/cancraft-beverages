import { useId } from "react";
import { cn } from "@/lib/utils";

type TextFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  maxLength?: number;
  multiline?: false;
};

export function TextField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  autoComplete,
  required,
  placeholder,
  helperText,
  maxLength,
}: TextFieldProps) {
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
      <input
        id={id}
        name={name}
        type={type}
        inputMode={type === "tel" ? "tel" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [helperText && helperId, error && errorId].filter(Boolean).join(" ") || undefined
        }
        className={cn(
          "mt-2 h-12 w-full rounded border bg-white px-4 text-base text-ink-950 placeholder:text-steel-600 transition-colors duration-micro ease-confident focus:outline-none focus-visible:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500/30",
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
