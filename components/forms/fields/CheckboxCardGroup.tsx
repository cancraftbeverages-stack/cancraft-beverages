import { useId } from "react";
import { cn } from "@/lib/utils";

export type CheckboxOption = { value: string; label: string };

type CheckboxCardGroupProps = {
  legend: string;
  name: string;
  options: CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  helperText?: string;
  columns?: 2 | 3 | 4;
};

const columnsClass: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

/** Accessible "pick many" control styled as selectable cards — native checkboxes, visually hidden. */
export function CheckboxCardGroup({
  legend,
  name,
  options,
  values,
  onChange,
  helperText,
  columns = 3,
}: CheckboxCardGroupProps) {
  const id = useId();
  const helperId = `${id}-helper`;

  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  return (
    <fieldset>
      <legend className="text-sm font-medium text-ink-950">
        {legend}
        <span className="ml-1.5 text-xs font-normal text-steel-600">optional — pick any that apply</span>
      </legend>
      {helperText ? (
        <p id={helperId} className="mt-1 text-xs text-steel-600">
          {helperText}
        </p>
      ) : null}

      <div className={cn("mt-3 grid gap-3", columnsClass[columns])}>
        {options.map((option) => {
          const optionId = `${name}-${option.value}`;
          const checked = values.includes(option.value);
          return (
            <label key={option.value} htmlFor={optionId} className="block cursor-pointer">
              <input
                type="checkbox"
                id={optionId}
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => toggle(option.value)}
                aria-describedby={helperText ? helperId : undefined}
                className="peer sr-only"
              />
              <span className="flex items-center gap-2.5 rounded border border-steel-300 bg-white px-4 py-3 text-sm font-medium text-ink-950 transition-colors duration-micro ease-confident peer-checked:border-accent-500 peer-checked:bg-accent-100 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-500">
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border text-[0.6rem] leading-none",
                    checked
                      ? "border-accent-500 bg-accent-500 text-ink-950"
                      : "border-steel-400 bg-white",
                  )}
                >
                  {checked ? "✓" : ""}
                </span>
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
