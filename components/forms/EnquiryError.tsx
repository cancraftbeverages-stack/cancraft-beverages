import { Button } from "@/components/ui/Button";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";

type EnquiryErrorProps = {
  message: string;
  onRetry: () => void;
};

/** Shown when submission genuinely fails (network/server error) — not a validation error. */
export function EnquiryError({ message, onRetry }: EnquiryErrorProps) {
  return (
    <div role="alert" className="mx-auto max-w-xl text-center">
      <span
        aria-hidden="true"
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-error text-2xl text-error"
      >
        !
      </span>
      <h2 className="mt-6 font-display text-2xl font-medium text-ink-950 sm:text-3xl">
        We couldn&apos;t submit that.
      </h2>
      <p className="mt-4 text-base leading-relaxed text-steel-600">{message}</p>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button type="button" onClick={onRetry} size="lg">
          Try Again
        </Button>
        <WhatsAppLink
          message="Hi CanCraft, I tried to submit a project enquiry on your website but ran into an error. Here are my project details:"
          className="inline-flex h-14 items-center justify-center rounded border border-steel-400/60 px-7 text-base font-medium text-ink-950 transition-colors duration-micro ease-confident hover:border-accent-500"
        >
          Message Us on WhatsApp Instead
        </WhatsAppLink>
      </div>
      <p className="mt-4 text-sm text-steel-600">
        Or <CallLink className="font-medium text-accent-600 hover:text-accent-500">call us directly</CallLink>.
      </p>
    </div>
  );
}
