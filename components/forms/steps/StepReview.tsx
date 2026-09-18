import {
  canSizeOptions,
  formulationStatusOptions,
  launchTimelineOptions,
  projectCategoryOptions,
  projectStageOptions,
  serviceOptions,
} from "@/content/enquiryOptions";
import { labelFor } from "@/lib/enquiry/labels";
import type { EnquiryPayload } from "@/lib/enquiry/types";

type StepReviewProps = {
  payload: EnquiryPayload;
  onEditStep: (stepIndex: number) => void;
};

export function StepReview({ payload, onEditStep }: StepReviewProps) {
  const groups = [
    {
      stepIndex: 0,
      title: "Beverage / Project",
      rows: [
        { label: "What are you making", value: labelFor(projectCategoryOptions, payload.project.category) },
        { label: "Project stage", value: labelFor(projectStageOptions, payload.project.stage) },
        { label: "Description", value: payload.project.description || "—" },
      ],
    },
    {
      stepIndex: 1,
      title: "Formulation",
      rows: [
        {
          label: "Formulation status",
          value: labelFor(formulationStatusOptions, payload.formulation.status),
        },
      ],
    },
    {
      stepIndex: 2,
      title: "Manufacturing",
      rows: [
        { label: "Preferred can size", value: labelFor(canSizeOptions, payload.manufacturing.canSize) },
        { label: "Expected volume", value: payload.manufacturing.expectedVolume || "—" },
        {
          label: "Launch timeline",
          value: payload.manufacturing.launchTimeline
            ? labelFor(launchTimelineOptions, payload.manufacturing.launchTimeline)
            : "—",
        },
      ],
    },
    {
      stepIndex: 3,
      title: "Services",
      rows: [
        {
          label: "Requested services",
          value:
            payload.services.length > 0
              ? payload.services.map((s) => labelFor(serviceOptions, s)).join(", ")
              : "Not specified",
        },
      ],
    },
    {
      stepIndex: 4,
      title: "Contact",
      rows: [
        { label: "Name", value: payload.contact.name },
        { label: "Company", value: payload.contact.company },
        { label: "Email", value: payload.contact.email },
        { label: "Phone / WhatsApp", value: payload.contact.phone },
        { label: "Additional info", value: payload.contact.additionalInfo || "—" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-steel-600">
        Review your project details below. You can go back and edit any section before
        submitting.
      </p>

      {groups.map((group) => (
        <div key={group.title} className="rounded border border-steel-300/60 bg-white/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-eyebrow text-steel-600">
              {group.title}
            </h3>
            <button
              type="button"
              onClick={() => onEditStep(group.stepIndex)}
              className="text-sm font-medium text-accent-600 hover:text-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
            >
              Edit<span className="sr-only"> {group.title}</span>
            </button>
          </div>
          <dl className="mt-3 space-y-2">
            {group.rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
                <dt className="w-40 shrink-0 text-xs text-steel-600">{row.label}</dt>
                <dd className="text-sm text-ink-950">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}

      <p className="text-xs leading-relaxed text-steel-600">
        Submitting records your project details in our system and notifies our team by email.
        For the fastest response, you can also reach us on WhatsApp or by phone below.
      </p>
    </div>
  );
}
