import { CheckboxCardGroup } from "@/components/forms/fields/CheckboxCardGroup";
import { serviceOptions } from "@/content/enquiryOptions";

type StepServicesProps = {
  value: string[];
  onChange: (values: string[]) => void;
};

export function StepServices({ value, onChange }: StepServicesProps) {
  return (
    <CheckboxCardGroup
      legend="Which services do you need?"
      name="services"
      options={serviceOptions}
      values={value}
      onChange={onChange}
      helperText="Select as many as apply — it's fine to leave this for us to advise on."
      columns={3}
    />
  );
}
