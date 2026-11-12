import { proofIndicators } from "@/content/capabilityStats";
import { cn } from "@/lib/utils";

type ProofStripProps = {
  className?: string;
};

/** Hero key-fact row (verified facts only — see content/capabilityStats.ts). */
export function ProofStrip({ className }: ProofStripProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-4 border-t border-paper-50/15 pt-8 sm:grid-cols-3",
        className,
      )}
    >
      {proofIndicators.map((indicator) => (
        <div key={indicator}>
          <dt className="sr-only">Key fact</dt>
          <dd className="font-display text-sm font-semibold tracking-wide text-paper-50 sm:text-base">
            {indicator}
          </dd>
        </div>
      ))}
    </dl>
  );
}
