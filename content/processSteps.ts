/**
 * Six-stage production process. MARKETING/PROCESS COPY describing
 * CanCraft's real workflow shape (Section 3 of the brief) — not a
 * verified numeric fact, but not invented either.
 */

export type ProcessStep = {
  index: string;
  title: string;
  description: string;
  image: string;
};

export const processSteps: ProcessStep[] = [
  {
    index: "01",
    title: "Concept",
    description:
      "We start with your idea — category, positioning and what the product needs to be.",
    image: "/media/facility/gallery-finished-cans.jpg",
  },
  {
    index: "02",
    title: "Formulation",
    description:
      "Our team develops or refines the formulation to match your concept and category.",
    image: "/media/facility/gallery-cip.jpg",
  },
  {
    index: "03",
    title: "Sampling",
    description:
      "Trial batches let you validate taste, carbonation and format before committing to volume.",
    image: "/media/facility/gallery-quality-control.jpg",
  },
  {
    index: "04",
    title: "Production",
    description:
      "Filling and seaming on our 120 cans/minute line, across 185 ml to 500 ml formats.",
    image: "/media/facility/gallery-filling.jpg",
  },
  {
    index: "05",
    title: "Quality",
    description:
      "Batches move through quality checks before they're cleared for packaging.",
    image: "/media/facility/gallery-inspection.jpg",
  },
  {
    index: "06",
    title: "Packaging & Dispatch",
    description:
      "Tray, shrink and box packaging, followed by warehousing and logistics to your destination.",
    image: "/media/facility/gallery-packaging.jpg",
  },
];
