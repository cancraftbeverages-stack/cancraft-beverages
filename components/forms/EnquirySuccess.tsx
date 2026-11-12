import Link from "next/link";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";

type EnquirySuccessProps = {
  referenceId: string;
};

/** Shown once the enquiry is genuinely recorded server-side. No SLA or response-time claim. */
export function EnquirySuccess({ referenceId }: EnquirySuccessProps) {
  return (
    <div role="status" className="mx-auto max-w-xl text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-500 text-2xl text-accent-600"
      >
        ✓
      </span>
      <h2 className="mt-6 font-display text-2xl font-medium text-ink-950 sm:text-3xl">
        Your project details have been recorded.
      </h2>
      <p className="mt-4 text-base leading-relaxed text-steel-600">
        Thanks, we&apos;ve received what you shared. For the fastest response, you can also reach
        us directly on WhatsApp or by phone. Otherwise, we&apos;ll follow up using the contact
        details you provided.
      </p>
      <p className="mt-2 text-xs text-steel-600">Reference: {referenceId}</p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <WhatsAppLink
          message="Hi CanCraft, I just submitted a project enquiry on your website and wanted to follow up directly."
          className="inline-flex h-12 items-center justify-center rounded bg-accent-500 px-6 text-sm font-medium text-ink-950 transition-colors duration-micro ease-confident hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
        >
          Message Us on WhatsApp
        </WhatsAppLink>
        <CallLink className="inline-flex h-12 items-center justify-center rounded border border-steel-400/60 px-6 text-sm font-medium text-ink-950 transition-colors duration-micro ease-confident hover:border-accent-500">
          Call CanCraft
        </CallLink>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row">
        <Link href="/" className="font-medium text-accent-600 hover:text-accent-500">
          Back to Home
        </Link>
        <span className="hidden text-steel-300 sm:inline" aria-hidden="true">
          ·
        </span>
        <Link href="/capabilities" className="font-medium text-accent-600 hover:text-accent-500">
          Explore Capabilities
        </Link>
      </div>
    </div>
  );
}
