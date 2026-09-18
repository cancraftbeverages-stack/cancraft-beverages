import { useId } from "react";
import { cn } from "@/lib/utils";

export type RadioOption = { value: string; label: string; description?: string };

type RadioCardGroupProps = {
  legend: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  helperText?: string;
  columns?: 2 | 3 | 4;
};

const columnsClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Accessible "pick one" control styled as selectable cards — native radios, visually hidden. */
export function RadioCardGroup({
  legend,
  name,
  options,
  value,
  onChange,
  onBlur,
  error,
  required,
  helperText,
  columns = 3,
}: RadioCardGroupProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-950">
        {legend}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-accent-600">
            *
          </span>
        ) : (
          <span className="ml-1.5 text-xs font-normal text-steel-600">optional</span>
        )}
      </legend>
      {helperText ? (
        <p id={helperId} className="mt-1 text-xs text-steel-600">
          {helperText}
        </p>
      ) : null}

      <div className={cn("mt-3 grid gap-3", columnsClass[columns])}>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          return (
            <label key={option.value} htmlFor={optionId} className="block cursor-pointer">
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                onBlur={onBlur}
                required={required}
                aria-describedby={
                  [helperText && helperId, error && errorId].filter(Boolean).join(" ") ||
                  undefined
                }
                className="peer sr-only"
              />
              <span className="block h-full rounded border border-steel-300 bg-white px-4 py-3 text-sm font-medium text-ink-950 transition-colors duration-micro ease-confident peer-checked:border-accent-500 peer-checked:bg-accent-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500">
                {option.label}
                {option.description ? (
                  <span className="mt-1 block text-xs font-normal leading-snug text-steel-600">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
