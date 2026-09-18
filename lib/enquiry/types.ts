/**
 * Enquiry data model — kept structured and future-proof so a later phase
 * can route this payload into a CRM, database, or automated workflow
 * without changing its shape.
 */

export type FormulationStatus =
  | "have-formulation"
  | "need-formulation"
  | "need-help-developing";

export type ProjectStage =
  | "idea"
  | "developing-formulation"
  | "ready-for-sampling"
  | "ready-for-production"
  | "existing-product";

export type CanSizeChoice = "185" | "250" | "330" | "500" | "not-decided";

export type LaunchTimeline =
  | "as-soon-as-possible"
  | "1-3-months"
  | "3-6-months"
  | "just-exploring";

export type EnquiryPayload = {
  project: {
    category: string;
    stage: ProjectStage | "";
    description: string;
  };
  formulation: {
    status: FormulationStatus | "";
  };
  manufacturing: {
    canSize: CanSizeChoice | "";
    expectedVolume: string;
    launchTimeline: LaunchTimeline | "";
  };
  services: string[];
  contact: {
    name: string;
    company: string;
    email: string;
    phone: string;
    additionalInfo: string;
  };
};

export const emptyEnquiryPayload: EnquiryPayload = {
  project: { category: "", stage: "", description: "" },
  formulation: { status: "" },
  manufacturing: { canSize: "", expectedVolume: "", launchTimeline: "" },
  services: [],
  contact: { name: "", company: "", email: "", phone: "", additionalInfo: "" },
};

/** A validated enquiry as stored — server-assigned fields added on top of the payload. */
export type StoredEnquiry = EnquiryPayload & {
  id: string;
  submittedAt: string;
};

export type EnquiryFieldErrors = {
  "project.category"?: string;
  "project.stage"?: string;
  "formulation.status"?: string;
  "manufacturing.canSize"?: string;
  "contact.name"?: string;
  "contact.company"?: string;
  "contact.email"?: string;
  "contact.phone"?: string;
};

export type EnquiryFieldKey = keyof EnquiryFieldErrors;
