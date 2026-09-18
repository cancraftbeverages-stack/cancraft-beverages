import { RadioCardGroup } from "@/components/forms/fields/RadioCardGroup";
import { formulationStatusOptions } from "@/content/enquiryOptions";
import type { EnquiryFieldErrors, EnquiryPayload, FormulationStatus } from "@/lib/enquiry/types";

type StepFormulationProps = {
  value: EnquiryPayload["formulation"];
  onChange: (patch: Partial<EnquiryPayload["formulation"]>) => void;
  errors: EnquiryFieldErrors;
};

export function StepFormulation({ value, onChange, errors }: StepFormulationProps) {
  return (
    <RadioCardGroup
      legend="Do you already have a formulation?"
      name="formulation-status"
      options={formulationStatusOptions}
      value={value.status}
      onChange={(v) => onChange({ status: v as FormulationStatus })}
      error={errors["formulation.status"]}
      required
      columns={3}
    />
  );
}
