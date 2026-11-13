import type { EnquiryFieldErrors, EnquiryPayload } from "./types";
import { hasUnsupportedCharacters } from "@/lib/text/unsupportedCharacters";
import {
  canSizeOptions,
  formulationStatusOptions,
  launchTimelineOptions,
  projectCategoryOptions,
  projectStageOptions,
  serviceOptions,
} from "@/content/enquiryOptions";

/**
 * Single source of truth for enquiry validation — used by the client (per
 * step and on final review) and re-run server-side in the API route.
 * Client-side validation is a UX convenience only; the server never trusts
 * it.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accepts digits, spaces, +, -, () — then requires at least 7 digits overall.
const PHONE_ALLOWED_RE = /^[0-9+\-()\s]+$/;

const categoryValues = new Set(projectCategoryOptions.map((o) => o.value));
const stageValues = new Set(projectStageOptions.map((o) => o.value));
const formulationValues = new Set(formulationStatusOptions.map((o) => o.value));
const canSizeValues = new Set(canSizeOptions.map((o) => o.value));
const launchTimelineValues = new Set<string>(launchTimelineOptions.map((o) => o.value));
const serviceValues = new Set(serviceOptions.map((o) => o.value));

function digitCount(value: string) {
  return (value.match(/\d/g) ?? []).length;
}

/**
 * Hidden control characters and broken Unicode cannot be stored (see
 * lib/text/unsupportedCharacters.ts). The value is rejected with a field
 * error rather than altered, so the visitor's text is never silently changed.
 */
const unsupportedCharacters = (label: string) =>
  `${label} contains unsupported hidden characters. Please retype it.`;

/**
 * Validates one step's worth of fields (or the whole payload). Pass the
 * full payload and this returns every error currently present — callers
 * that only care about one step filter by key prefix.
 */
export function validateEnquiry(payload: EnquiryPayload): EnquiryFieldErrors {
  const errors: EnquiryFieldErrors = {};

  if (!payload.project.category || !categoryValues.has(payload.project.category)) {
    errors["project.category"] = "Select what you're making.";
  }
  if (!payload.project.stage || !stageValues.has(payload.project.stage)) {
    errors["project.stage"] = "Select your project stage.";
  }

  if (!payload.formulation.status || !formulationValues.has(payload.formulation.status)) {
    errors["formulation.status"] = "Let us know your formulation status.";
  }

  if (!payload.manufacturing.canSize || !canSizeValues.has(payload.manufacturing.canSize)) {
    errors["manufacturing.canSize"] = "Select a preferred can size (or \"Not decided yet\").";
  }

  // Optional free text: no content rules, only the unsupported-character check.
  if (hasUnsupportedCharacters(payload.project.description)) {
    errors["project.description"] = unsupportedCharacters("Project description");
  }
  if (hasUnsupportedCharacters(payload.manufacturing.expectedVolume)) {
    errors["manufacturing.expectedVolume"] = unsupportedCharacters("Expected volume");
  }
  // Optional, chosen from a fixed list in the form: empty or one of the listed
  // values. Anything else can only come from a crafted request. The
  // hidden-character message takes priority over the list message.
  const timeline = payload.manufacturing.launchTimeline;
  if (hasUnsupportedCharacters(timeline)) {
    errors["manufacturing.launchTimeline"] = unsupportedCharacters("Launch timeline");
  } else if (timeline !== "" && !launchTimelineValues.has(timeline)) {
    errors["manufacturing.launchTimeline"] = "Select a launch timeline from the list.";
  }
  if (hasUnsupportedCharacters(payload.contact.additionalInfo)) {
    errors["contact.additionalInfo"] = unsupportedCharacters("Additional information");
  }

  const name = payload.contact.name.trim();
  if (!name) {
    errors["contact.name"] = "Enter your name.";
  } else if (name.length > 100) {
    errors["contact.name"] = "Name is too long.";
  } else if (hasUnsupportedCharacters(payload.contact.name)) {
    errors["contact.name"] = unsupportedCharacters("Name");
  }

  const companyName = payload.contact.company.trim();
  if (!companyName) {
    errors["contact.company"] = "Enter your company or brand name.";
  } else if (companyName.length > 100) {
    errors["contact.company"] = "Company name is too long.";
  } else if (hasUnsupportedCharacters(payload.contact.company)) {
    errors["contact.company"] = unsupportedCharacters("Company name");
  }

  const email = payload.contact.email.trim();
  if (!email) {
    errors["contact.email"] = "Enter your email address.";
  } else if (hasUnsupportedCharacters(payload.contact.email)) {
    errors["contact.email"] = unsupportedCharacters("Email address");
  } else if (email.length > 254 || !EMAIL_RE.test(email)) {
    errors["contact.email"] = "Enter a valid email address.";
  }

  // PHONE_ALLOWED_RE's \s also matches vertical tab and form feed, so the
  // shared check runs here too.
  const phone = payload.contact.phone.trim();
  if (!phone) {
    errors["contact.phone"] = "Enter a phone or WhatsApp number.";
  } else if (hasUnsupportedCharacters(payload.contact.phone)) {
    errors["contact.phone"] = unsupportedCharacters("Phone number");
  } else if (phone.length > 20 || !PHONE_ALLOWED_RE.test(phone) || digitCount(phone) < 7) {
    errors["contact.phone"] = "Enter a valid phone number, including country code.";
  }

  return errors;
}

/**
 * Coerces/clamps an arbitrary parsed JSON body into a well-formed
 * EnquiryPayload before validation — the server never trusts the shape of
 * client-sent JSON.
 */
export function sanitizeEnquiryPayload(input: unknown): EnquiryPayload {
  const body = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const project = (body.project ?? {}) as Record<string, unknown>;
  const formulation = (body.formulation ?? {}) as Record<string, unknown>;
  const manufacturing = (body.manufacturing ?? {}) as Record<string, unknown>;
  const contact = (body.contact ?? {}) as Record<string, unknown>;
  const rawServices = Array.isArray(body.services) ? body.services : [];

  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.slice(0, max) : "";

  return {
    project: {
      category: str(project.category, 60),
      stage: str(project.stage, 60) as EnquiryPayload["project"]["stage"],
      description: str(project.description, 1000),
    },
    formulation: {
      status: str(formulation.status, 60) as EnquiryPayload["formulation"]["status"],
    },
    manufacturing: {
      canSize: str(manufacturing.canSize, 20) as EnquiryPayload["manufacturing"]["canSize"],
      expectedVolume: str(manufacturing.expectedVolume, 200),
      launchTimeline: str(
        manufacturing.launchTimeline,
        30,
      ) as EnquiryPayload["manufacturing"]["launchTimeline"],
    },
    services: rawServices
      .filter((s): s is string => typeof s === "string" && serviceValues.has(s))
      .slice(0, serviceValues.size),
    // Identifying contact fields are clamped to a generous ceiling — well
    // above the real limit validateEnquiry enforces (100/254/20) — rather
    // than the real limit itself. Truncating exactly to the real limit here
    // would silently corrupt (and successfully accept) oversized input
    // instead of surfacing a "too long" validation error; the ceiling below
    // only guards against pathological payload sizes.
    contact: {
      name: str(contact.name, 500),
      company: str(contact.company, 500),
      email: str(contact.email, 1000),
      phone: str(contact.phone, 100),
      additionalInfo: str(contact.additionalInfo, 1000),
    },
  };
}
