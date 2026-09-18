import { TextField } from "@/components/forms/fields/TextField";
import { TextAreaField } from "@/components/forms/fields/TextAreaField";
import type { EnquiryFieldErrors, EnquiryPayload } from "@/lib/enquiry/types";

type StepContactProps = {
  value: EnquiryPayload["contact"];
  onChange: (patch: Partial<EnquiryPayload["contact"]>) => void;
  errors: EnquiryFieldErrors;
};

export function StepContact({ value, onChange, errors }: StepContactProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Name"
          name="contact-name"
          value={value.name}
          onChange={(v) => onChange({ name: v })}
          autoComplete="name"
          required
          error={errors["contact.name"]}
          maxLength={100}
        />
        <TextField
          label="Company"
          name="contact-company"
          value={value.company}
          onChange={(v) => onChange({ company: v })}
          autoComplete="organization"
          required
          error={errors["contact.company"]}
          maxLength={100}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Email"
          name="contact-email"
          type="email"
          value={value.email}
          onChange={(v) => onChange({ email: v })}
          autoComplete="email"
          required
          error={errors["contact.email"]}
          maxLength={254}
        />
        <TextField
          label="Phone / WhatsApp"
          name="contact-phone"
          type="tel"
          value={value.phone}
          onChange={(v) => onChange({ phone: v })}
          autoComplete="tel"
          required
          error={errors["contact.phone"]}
          placeholder="+91 XXXXX XXXXX"
          maxLength={20}
        />
      </div>

      <TextAreaField
        label="Anything else we should know?"
        name="contact-additional-info"
        value={value.additionalInfo}
        onChange={(v) => onChange({ additionalInfo: v })}
        maxLength={1000}
        rows={3}
      />
    </div>
  );
}
