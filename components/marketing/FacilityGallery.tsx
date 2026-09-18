import Image from "next/image";
import { PageShell } from "@/components/layout/PageShell";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { PlaceholderMedia } from "@/components/ui/PlaceholderMedia";

const slots: { label: string; wide?: boolean; image?: string }[] = [
  { label: "Factory exterior", wide: true },
  { label: "Production floor", image: "/media/facility/gallery-production-floor.jpg" },
  { label: "Can handling", image: "/media/facility/gallery-can-handling.jpg" },
  { label: "Filling", image: "/media/facility/gallery-filling.jpg" },
  { label: "Seaming", image: "/media/facility/gallery-seaming.jpg" },
  { label: "Conveyors", wide: true, image: "/media/facility/gallery-conveyors.jpg" },
  { label: "Inspection", image: "/media/facility/gallery-inspection.jpg" },
  { label: "Coding" },
  { label: "Packaging", image: "/media/facility/gallery-packaging.jpg" },
  { label: "Warehouse", image: "/media/facility/gallery-warehouse.jpg" },
  { label: "Quality control", image: "/media/facility/gallery-quality-control.jpg" },
  { label: "Finished cans", image: "/media/facility/gallery-finished-cans.jpg" },
  { label: "Batching & CIP", image: "/media/facility/gallery-cip.jpg" },
  { label: "Team", wide: true },
];

export function FacilityGallery() {
  return (
    <section className="bg-ink-900 py-20 text-paper-50 lg:py-28">
      <PageShell>
        <Reveal>
          <SectionHeading
            eyebrow="Inside CanCraft"
            title={"Built to manufacture.\nDesigned to scale."}
            tone="dark"
          />
        </Reveal>

        <RevealGroup as="ul" className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {slots.map((slot) => (
            <RevealItem
              as="li"
              key={slot.label}
              className={slot.wide ? "col-span-2" : "col-span-1"}
            >
              {slot.image ? (
                <div
                  className={`relative overflow-hidden rounded border border-steel-600/40 bg-ink-900 ${
                    slot.wide ? "aspect-[16/9]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={slot.image}
                    alt={`${slot.label} — CanCraft beverage can manufacturing`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <PlaceholderMedia label={slot.label} aspect={slot.wide ? "wide" : "square"} />
              )}
            </RevealItem>
          ))}
        </RevealGroup>
      </PageShell>
    </section>
  );
}
