import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  supporting?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
};

/**
 * Consistent eyebrow + headline + optional supporting line, used at the
 * top of every marketing section for rhythm consistency.
 */
export function SectionHeading({
  eyebrow,
  title,
  supporting,
  align = "left",
  tone = "light",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-body font-semibold uppercase tracking-eyebrow",
            tone === "light" ? "text-accent-600" : "text-accent-500",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "whitespace-pre-line font-display text-3xl font-medium leading-[1.1] sm:text-4xl lg:text-5xl",
          tone === "light" ? "text-ink-800" : "text-paper-50",
        )}
      >
        {title}
      </h2>
      {supporting ? (
        <p
          className={cn(
            "mt-4 text-base leading-relaxed sm:text-lg",
            tone === "light" ? "text-steel-600" : "text-steel-300",
          )}
        >
          {supporting}
        </p>
      ) : null}
    </div>
  );
}
