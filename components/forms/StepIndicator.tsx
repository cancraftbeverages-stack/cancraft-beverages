import { cn } from "@/lib/utils";

type StepIndicatorProps = {
  steps: string[];
  currentIndex: number;
};

export function StepIndicator({ steps, currentIndex }: StepIndicatorProps) {
  const percent = Math.round(((currentIndex + 1) / steps.length) * 100);

  return (
    <nav aria-label="Enquiry progress">
      {/* Mobile: compact label + progress bar */}
      <div className="sm:hidden">
        <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent-600">
          Step {currentIndex + 1} of {steps.length} — {steps[currentIndex]}
        </p>
        <div
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Enquiry progress"
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-steel-300/50"
        >
          <div
            className="h-full rounded-full bg-accent-500 transition-[width] duration-standard ease-confident"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Desktop: full step list */}
      <ol className="hidden gap-2 sm:flex">
        {steps.map((step, i) => {
          const isCurrent = i === currentIndex;
          const isComplete = i < currentIndex;
          return (
            <li
              key={step}
              aria-current={isCurrent ? "step" : undefined}
              className="flex flex-1 items-center gap-2"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isCurrent && "border-accent-500 bg-accent-500 text-ink-950",
                  isComplete && "border-accent-500 bg-accent-100 text-ink-950",
                  !isCurrent && !isComplete && "border-steel-300 text-steel-600",
                )}
              >
                {isComplete ? "✓" : i + 1}
              </span>
              {/* Always present for screen readers; visually hidden below lg to match the compact circle-only layout. */}
              <span
                className={cn(
                  "sr-only text-xs font-medium lg:not-sr-only lg:inline",
                  isCurrent ? "text-ink-950" : "text-steel-600",
                )}
              >
                {step}
              </span>
              {i < steps.length - 1 ? (
                <span aria-hidden="true" className="h-px flex-1 bg-steel-300/60" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
