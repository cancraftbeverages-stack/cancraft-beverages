import { proofIndicators } from "@/content/capabilityStats";
import { cn } from "@/lib/utils";

type ProofStripProps = {
  className?: string;
};

/** The 120 CANS/MIN · 185–500 ML · NO MOQ · NCR, INDIA proof row. */
export function ProofStrip({ className }: ProofStripProps) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-x-6 gap-y-5 border-t border-paper-50/15 pt-8 sm:grid-cols-4",
        className,
      )}
    >
      {proofIndicators.map((indicator) => (
        <div key={indicator}>
          <dt className="sr-only">Proof indicator</dt>
          <dd className="font-display text-sm font-semibold tracking-wide text-paper-50 sm:text-base">
            {indicator}
          </dd>
        </div>
      ))}
    </dl>
  );
}
