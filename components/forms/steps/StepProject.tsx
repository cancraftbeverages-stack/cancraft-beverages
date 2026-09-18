import { RadioCardGroup } from "@/components/forms/fields/RadioCardGroup";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import { projectCategoryOptions, projectStageOptions } from "@/content/enquiryOptions";
import type { EnquiryFieldErrors, EnquiryPayload, ProjectStage } from "@/lib/enquiry/types";

type StepProjectProps = {
  value: EnquiryPayload["project"];
  onChange: (patch: Partial<EnquiryPayload["project"]>) => void;
  errors: EnquiryFieldErrors;
};

export function StepProject({ value, onChange, errors }: StepProjectProps) {
  return (
    <div className="space-y-8">
      <RadioCardGroup
        legend="What are you making?"
        name="project-category"
        options={projectCategoryOptions}
        value={value.category}
        onChange={(v) => onChange({ category: v })}
        error={errors["project.category"]}
        required
        columns={3}
      />

      <RadioCardGroup
        legend="Project stage"
        name="project-stage"
        options={projectStageOptions}
        value={value.stage}
        onChange={(v) => onChange({ stage: v as ProjectStage })}
        error={errors["project.stage"]}
        required
        columns={3}
      />

      <TextAreaField
        label="Brief description or idea"
        name="project-description"
        value={value.description}
        onChange={(v) => onChange({ description: v })}
        helperText="Anything that helps us understand the product — positioning, flavour direction, what inspired it."
        maxLength={1000}
        rows={4}
      />
    </div>
  );
}
