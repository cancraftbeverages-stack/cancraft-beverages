import { cn } from "@/lib/utils";

type PlaceholderMediaProps = {
  /** What this slot will eventually show, e.g. "Production floor". */
  label: string;
  /** Optional longer note, defaults to the standard replace-me copy. */
  note?: string;
  aspect?: "video" | "square" | "portrait" | "wide";
  className?: string;
};

const aspectClasses: Record<NonNullable<PlaceholderMediaProps["aspect"]>, string> = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
};

/**
 * Intentional media placeholder — deliberately styled so it reads as a
 * designed slot awaiting real photography/video, never as a broken image
 * or (worse) as fabricated CanCraft factory imagery.
 */
export function PlaceholderMedia({
  label,
  note = "REAL FACTORY MEDIA TO BE PROVIDED",
  aspect = "video",
  className,
}: PlaceholderMediaProps) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label} — real photography to be added`}
      className={cn(
        "relative flex flex-col justify-end overflow-hidden rounded border border-steel-600/40 bg-ink-900 text-paper-50",
        aspectClasses[aspect],
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #9C978C 0px, #9C978C 2px, transparent 2px, transparent 14px)",
        }}
      />
      <div className="relative flex items-center justify-between gap-3 border-t border-steel-600/40 bg-ink-950/70 px-4 py-3 backdrop-blur-sm">
        <span className="font-display text-sm font-medium text-paper-50">{label}</span>
        <span className="text-right text-[0.65rem] font-medium uppercase tracking-eyebrow text-accent-500">
          {note}
        </span>
      </div>
    </div>
  );
}
