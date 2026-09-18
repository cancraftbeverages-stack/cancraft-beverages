/**
 * Resolves a stored option value (e.g. "energy-drinks") to its human-readable
 * label (e.g. "Energy Drinks"). Shared between the Review step UI
 * (components/forms/steps/StepReview.tsx) and the notification email
 * builder (lib/enquiry/email.ts) so the two never drift apart.
 */
export function labelFor(options: { value: string; label: string }[], value: string) {
  return options.find((o) => o.value === value)?.label || "—";
}
