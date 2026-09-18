/**
 * Option lists for the Start Your Beverage Project enquiry form.
 * Can sizes and services are drawn from the verified fact registry
 * (content/company.ts) rather than re-typed here.
 */

import { company } from "./company";
import { beverageCategories } from "./beverageCategories";
import type {
  CanSizeChoice,
  FormulationStatus,
  LaunchTimeline,
  ProjectStage,
} from "@/lib/enquiry/types";

export const projectCategoryOptions = [
  ...beverageCategories.map((c) => ({ value: c.slug, label: c.name })),
  { value: "other", label: "Other / not listed" },
];

export const projectStageOptions: { value: ProjectStage; label: string }[] = [
  { value: "idea", label: "Idea" },
  { value: "developing-formulation", label: "Developing formulation" },
  { value: "ready-for-sampling", label: "Ready for sampling" },
  { value: "ready-for-production", label: "Ready for production" },
  { value: "existing-product", label: "Existing product / looking for manufacturer" },
];

export const formulationStatusOptions: {
  value: FormulationStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "have-formulation",
    label: "Yes — I have a formulation",
    description: "Your recipe is ready; we manufacture to it.",
  },
  {
    value: "need-formulation",
    label: "No — I need formulation support",
    description: "We develop the formulation with you.",
  },
  {
    value: "need-help-developing",
    label: "I have an idea and need help developing it",
    description: "We refine your concept into a workable formulation.",
  },
];

export const canSizeOptions: { value: CanSizeChoice; label: string }[] = [
  ...company.productionLine.canSizesMl.map((ml) => ({
    value: String(ml) as CanSizeChoice,
    label: `${ml} ml`,
  })),
  { value: "not-decided", label: "Not decided yet" },
];

export const launchTimelineOptions: { value: LaunchTimeline; label: string }[] = [
  { value: "as-soon-as-possible", label: "As soon as possible" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "just-exploring", label: "Just exploring" },
];

export const serviceOptions = [
  ...company.services.map((label) => ({ value: label, label })),
  { value: "Not sure yet", label: "Not sure yet" },
];
