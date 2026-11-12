import { PageShell } from "@/components/layout/PageShell";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { CallLink } from "@/components/ui/CallLink";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { company } from "@/content/company";

const channels = [
  {
    key: "call",
    label: "Call",
    value: company.contact.phoneDisplay,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    value: company.contact.phoneDisplay,
  },
  {
    key: "email",
    label: "Email",
    value: company.contact.email,
  },
  {
    key: "factory",
    label: "Factory",
    value: company.factory.display,
  },
];

/** Contact channel cards — the /contact page's primary content block. */
export function ContactDetails() {
  return (
    <section className="bg-paper-50 py-20 lg:py-28">
      <PageShell>
        <RevealGroup as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => {
            const card = (
              <div className="h-full rounded border border-steel-300/60 bg-white/40 p-7 transition-colors duration-standard ease-confident hover:border-accent-500/60">
                <p className="text-xs font-semibold uppercase tracking-eyebrow text-accent-600">
                  {channel.label}
                </p>
                <p className="mt-3 font-display text-lg font-medium leading-snug text-ink-950">
                  {channel.value}
                </p>
              </div>
            );

            return (
              <RevealItem as="li" key={channel.key}>
                {channel.key === "call" ? (
                  <CallLink aria-label={`Call CanCraft at ${company.contact.phoneDisplay}`} className="block h-full">
                    {card}
                  </CallLink>
                ) : channel.key === "whatsapp" ? (
                  <WhatsAppLink
                    aria-label="Message CanCraft on WhatsApp"
                    className="block h-full"
                  >
                    {card}
                  </WhatsAppLink>
                ) : channel.key === "email" ? (
                  <a
                    href={`mailto:${company.contact.email}`}
                    className="block h-full"
                    aria-label={`Email CanCraft at ${company.contact.email}`}
                  >
                    {card}
                  </a>
                ) : (
                  card
                )}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
