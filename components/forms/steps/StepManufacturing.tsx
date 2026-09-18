import { RadioCardGroup } from "@/components/forms/fields/RadioCardGroup";
import { TextField } from "@/components/forms/fields/TextField";
import { canSizeOptions, launchTimelineOptions } from "@/content/enquiryOptions";
import type {
  CanSizeChoice,
  EnquiryFieldErrors,
  EnquiryPayload,
  LaunchTimeline,
} from "@/lib/enquiry/types";

type StepManufacturingProps = {
  value: EnquiryPayload["manufacturing"];
  onChange: (patch: Partial<EnquiryPayload["manufacturing"]>) => void;
  errors: EnquiryFieldErrors;
};

export function StepManufacturing({ value, onChange, errors }: StepManufacturingProps) {
  return (
    <div className="space-y-8">
      <RadioCardGroup
        legend="Preferred can size"
        name="manufacturing-can-size"
        options={canSizeOptions}
        value={value.canSize}
        onChange={(v) => onChange({ canSize: v as CanSizeChoice })}
        error={errors["manufacturing.canSize"]}
        required
        columns={3}
      />

      <TextField
        label="Expected volume"
        name="manufacturing-expected-volume"
        value={value.expectedVolume}
        onChange={(v) => onChange({ expectedVolume: v })}
        placeholder="e.g. a trial batch, or 5,000 cans"
        helperText="There's no minimum order — describe whatever you have in mind, including a trial batch."
        maxLength={200}
      />

      <RadioCardGroup
        legend="Desired launch timeline"
        name="manufacturing-launch-timeline"
        options={launchTimelineOptions}
        value={value.launchTimeline}
        onChange={(v) => onChange({ launchTimeline: v as LaunchTimeline })}
        columns={4}
      />
    </div>
  );
}
