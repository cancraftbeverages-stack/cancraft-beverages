import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { startProjectHref } from "@/content/navigation";
import { Button } from "@/components/ui/Button";

/** Fixed bottom utility bar — mobile only. Keeps Call / WhatsApp / Start Project always reachable. */
export function MobileUtilityBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex items-stretch gap-2 border-t border-steel-600/25 bg-ink-950/95 px-3 py-2.5 backdrop-blur xl:hidden"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}
    >
      <CallLink
        aria-label="Call CanCraft"
        className="flex flex-1 items-center justify-center gap-2 rounded border border-steel-400/50 text-sm font-medium text-paper-50"
      >
        Call
      </CallLink>
      <WhatsAppLink
        aria-label="Message CanCraft on WhatsApp"
        className="flex flex-1 items-center justify-center gap-2 rounded border border-steel-400/50 text-sm font-medium text-paper-50"
      >
        WhatsApp
      </WhatsAppLink>
      <Button href={startProjectHref} size="md" className="flex-[1.4]">
        Start Project
      </Button>
    </div>
  );
}
