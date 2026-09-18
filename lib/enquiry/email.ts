import { Resend } from "resend";
import {
  canSizeOptions,
  formulationStatusOptions,
  launchTimelineOptions,
  projectCategoryOptions,
  projectStageOptions,
  serviceOptions,
} from "@/content/enquiryOptions";
import { company } from "@/content/company";
import { labelFor } from "./labels";
import type { StoredEnquiry } from "./types";

/**
 * `sent: true` means Resend's API *accepted* the send request — not that
 * the email was confirmed delivered to an inbox. Confirming actual delivery
 * would need Resend's delivery webhooks (not implemented here). Never
 * upgrade this distinction to "delivered" language anywhere it's surfaced.
 */
export type EmailResult = { sent: true } | { sent: false; reason: string };

export function buildNotificationSubject(record: StoredEnquiry): string {
  const category = labelFor(projectCategoryOptions, record.project.category);
  return `New beverage enquiry — ${category} (${record.contact.company})`;
}

/** Plain-text body — the same fields already shown on the Review step. */
export function buildNotificationBody(record: StoredEnquiry): string {
  return [
    `Enquiry ID: ${record.id}`,
    `Submitted: ${record.submittedAt}`,
    "",
    "PROJECT",
    `What they're making: ${labelFor(projectCategoryOptions, record.project.category)}`,
    `Project stage: ${labelFor(projectStageOptions, record.project.stage)}`,
    `Description: ${record.project.description || "—"}`,
    "",
    "FORMULATION",
    `Status: ${labelFor(formulationStatusOptions, record.formulation.status)}`,
    "",
    "MANUFACTURING",
    `Preferred can size: ${labelFor(canSizeOptions, record.manufacturing.canSize)}`,
    `Expected volume: ${record.manufacturing.expectedVolume || "—"}`,
    `Launch timeline: ${
      record.manufacturing.launchTimeline
        ? labelFor(launchTimelineOptions, record.manufacturing.launchTimeline)
        : "—"
    }`,
    "",
    "SERVICES",
    record.services.length > 0
      ? record.services.map((s) => labelFor(serviceOptions, s)).join(", ")
      : "Not specified",
    "",
    "CONTACT",
    `Name: ${record.contact.name}`,
    `Company: ${record.contact.company}`,
    `Email: ${record.contact.email}`,
    `Phone / WhatsApp: ${record.contact.phone}`,
    `Additional info: ${record.contact.additionalInfo || "—"}`,
  ].join("\n");
}

/**
 * Defense-in-depth only: contact.email already passed validateEnquiry's
 * regex (which disallows whitespace, so no CR/LF is possible) before this
 * is ever reached. Stripped again here so the Reply-To header can never
 * carry injected header content even if that invariant is ever weakened.
 */
function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]/g, " ").trim();
}

/**
 * Sends the internal lead-notification email. Never throws — every failure
 * mode (missing config, provider error, network error) resolves to
 * `{ sent: false, reason }` so the caller (app/api/enquiry/route.ts) can
 * treat this as a best-effort side effect that must never fail an
 * otherwise-successful enquiry submission.
 */
export async function sendEnquiryNotification(record: StoredEnquiry): Promise<EmailResult> {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS;
  // Defaults to CanCraft's verified contact address (content/company.ts)
  // so the recipient doesn't need to be explicitly set to work correctly —
  // ENQUIRY_NOTIFICATION_EMAIL exists to override it, not to require it.
  const to = process.env.ENQUIRY_NOTIFICATION_EMAIL || company.contact.email;

  if (!apiKey || !from) {
    return { sent: false, reason: "not-configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: sanitizeHeaderValue(record.contact.email),
      subject: buildNotificationSubject(record),
      text: buildNotificationBody(record),
    });

    if (error) {
      return { sent: false, reason: error.message || "unknown-provider-error" };
    }
    return { sent: true };
  } catch (err) {
    return { sent: false, reason: err instanceof Error ? err.message : "unknown-error" };
  }
}
