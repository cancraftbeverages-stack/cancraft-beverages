"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { StepIndicator } from "@/components/forms/StepIndicator";
import { StepProject } from "@/components/forms/steps/StepProject";
import { StepFormulation } from "@/components/forms/steps/StepFormulation";
import { StepManufacturing } from "@/components/forms/steps/StepManufacturing";
import { StepServices } from "@/components/forms/steps/StepServices";
import { StepContact } from "@/components/forms/steps/StepContact";
import { StepReview } from "@/components/forms/steps/StepReview";
import { EnquirySuccess } from "@/components/forms/EnquirySuccess";
import { EnquiryError } from "@/components/forms/EnquiryError";
import { Button } from "@/components/ui/Button";
import { validateEnquiry } from "@/lib/enquiry/validate";
import { emptyEnquiryPayload } from "@/lib/enquiry/types";
import { easeConfident } from "@/lib/motion";
import { currentAttribution, noteFormStart } from "@/lib/attribution/browser";
import { noteEnquirySubmitted } from "@/lib/analytics/ga";
import type { EnquiryFieldErrors, EnquiryFieldKey, EnquiryPayload } from "@/lib/enquiry/types";

const stepLabels = [
  "Beverage / Project",
  "Formulation",
  "Manufacturing",
  "Services",
  "Contact",
  "Review",
];

const stepFieldKeys: EnquiryFieldKey[][] = [
  ["project.category", "project.stage"],
  ["formulation.status"],
  ["manufacturing.canSize"],
  [],
  ["contact.name", "contact.company", "contact.email", "contact.phone"],
  [],
];

type Status = "idle" | "submitting" | "success" | "error";

export function EnquiryForm() {
  const prefersReducedMotion = useReducedMotion();
  // Generated once per form session (including across a failed-then-retried
  // submit) so a retry sends the SAME id — the server's idempotent insert
  // (ON CONFLICT (id) DO NOTHING) then guarantees a retry never creates a
  // second row or sends a second notification email. A fresh page load
  // starts a genuinely new enquiry with a fresh id.
  const [enquiryId] = useState(() => crypto.randomUUID());
  const [payload, setPayload] = useState<EnquiryPayload>(emptyEnquiryPayload);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<EnquiryFieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [referenceId, setReferenceId] = useState("");

  const summaryRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const hasMountedRef = useRef(false);

  const currentStepErrorKeys = (stepFieldKeys[currentStep] ?? []).filter((k) => errors[k]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (currentStepErrorKeys.length > 0) {
      summaryRef.current?.focus();
    } else {
      headingRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, errors]);

  // form_start: recorded once, on the first change to any field — only a
  // timestamp, the page path and a random session id; never a field value.
  // noteFormStart() is itself idempotent per tab session; the ref just
  // avoids touching storage on every keystroke.
  const formStartedRef = useRef(false);
  function markFormStarted() {
    if (formStartedRef.current) return;
    formStartedRef.current = true;
    try {
      noteFormStart();
    } catch {
      // Never let attribution interfere with filling in the form.
    }
  }

  function updateProject(patch: Partial<EnquiryPayload["project"]>) {
    markFormStarted();
    setPayload((p) => ({ ...p, project: { ...p.project, ...patch } }));
  }
  function updateFormulation(patch: Partial<EnquiryPayload["formulation"]>) {
    markFormStarted();
    setPayload((p) => ({ ...p, formulation: { ...p.formulation, ...patch } }));
  }
  function updateManufacturing(patch: Partial<EnquiryPayload["manufacturing"]>) {
    markFormStarted();
    setPayload((p) => ({ ...p, manufacturing: { ...p.manufacturing, ...patch } }));
  }
  function updateServices(values: string[]) {
    markFormStarted();
    setPayload((p) => ({ ...p, services: values }));
  }
  function updateContact(patch: Partial<EnquiryPayload["contact"]>) {
    markFormStarted();
    setPayload((p) => ({ ...p, contact: { ...p.contact, ...patch } }));
  }

  function handleContinue() {
    const allErrors = validateEnquiry(payload);
    const keysForStep = stepFieldKeys[currentStep] ?? [];
    const relevantErrors: EnquiryFieldErrors = {};
    keysForStep.forEach((key) => {
      if (allErrors[key]) relevantErrors[key] = allErrors[key];
    });

    if (Object.keys(relevantErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...relevantErrors }));
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      keysForStep.forEach((key) => delete next[key]);
      return next;
    });
    setCurrentStep((s) => Math.min(s + 1, stepLabels.length - 1));
  }

  function handleBack() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  function handleEditStep(stepIndex: number) {
    setCurrentStep(stepIndex);
  }

  async function handleSubmit() {
    const allErrors = validateEnquiry(payload);
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      const firstStepWithError = stepFieldKeys.findIndex((keys) =>
        keys.some((k) => allErrors[k]),
      );
      setCurrentStep(firstStepWithError === -1 ? 0 : firstStepWithError);
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Attribution travels only with the enquiry, to our own API (no third party).
        body: JSON.stringify({ ...payload, id: enquiryId, attribution: currentAttribution() }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setReferenceId(data.id);
        noteEnquirySubmitted(); // analytics event only (no payload); see lib/analytics/ga.ts
        setStatus("success");
        return;
      }

      if (data?.errors) {
        setErrors(data.errors as EnquiryFieldErrors);
        const firstStepWithError = stepFieldKeys.findIndex((keys) =>
          keys.some((k) => data.errors[k]),
        );
        if (firstStepWithError !== -1) setCurrentStep(firstStepWithError);
        setErrorMessage(
          data.errors.form || "Some details need attention — please review and try again.",
        );
      } else {
        setErrorMessage("Something went wrong on our end. Please try again.");
      }
      setStatus("error");
    } catch {
      setErrorMessage("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  function handleRetry() {
    setStatus("idle");
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentStep === stepLabels.length - 1) {
      void handleSubmit();
    } else {
      handleContinue();
    }
  }

  if (status === "success") {
    return <EnquirySuccess referenceId={referenceId} />;
  }

  if (status === "error") {
    return <EnquiryError message={errorMessage} onRetry={handleRetry} />;
  }

  const isReview = currentStep === stepLabels.length - 1;
  const isSubmitting = status === "submitting";

  return (
    <form onSubmit={handleFormSubmit} noValidate aria-label="Beverage project enquiry">
      <StepIndicator steps={stepLabels} currentIndex={currentStep} />

      <div className="mt-10">
        {currentStepErrorKeys.length > 0 ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="mb-8 rounded border border-error bg-error/5 p-4 focus:outline-none"
          >
            <p className="font-medium text-error">Please fix the following before continuing:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-error">
              {currentStepErrorKeys.map((key) => (
                <li key={key}>{errors[key]}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-display text-2xl font-medium text-ink-950 focus:outline-none sm:text-3xl"
        >
          {stepLabels[currentStep]}
        </h2>

        <div className="mt-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -16 }}
              transition={{ duration: 0.3, ease: easeConfident }}
            >
              {currentStep === 0 && (
                <StepProject value={payload.project} onChange={updateProject} errors={errors} />
              )}
              {currentStep === 1 && (
                <StepFormulation
                  value={payload.formulation}
                  onChange={updateFormulation}
                  errors={errors}
                />
              )}
              {currentStep === 2 && (
                <StepManufacturing
                  value={payload.manufacturing}
                  onChange={updateManufacturing}
                  errors={errors}
                />
              )}
              {currentStep === 3 && (
                <StepServices value={payload.services} onChange={updateServices} />
              )}
              {currentStep === 4 && (
                <StepContact value={payload.contact} onChange={updateContact} errors={errors} />
              )}
              {isReview && <StepReview payload={payload} onEditStep={handleEditStep} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          aria-live="polite"
          className="mt-10 flex flex-col-reverse gap-3 border-t border-steel-300/60 pt-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            {currentStep > 0 ? (
              <Button type="button" variant="ghost" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            ) : null}
          </div>

          {isReview ? (
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit Project"}
            </Button>
          ) : (
            <Button type="submit" size="lg">
              Continue
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
