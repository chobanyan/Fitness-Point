"use client";

import { useState } from "react";
import { isValidPhoneNumber } from "libphonenumber-js";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Input } from "@/components/ui/Input";
import { Radio } from "@/components/ui/Radio";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export interface BookingFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  interestArea: string;
  consent: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function BookingForm({
  dict,
  onSubmit,
  onBack,
  submitting,
  serverError,
}: {
  dict: Dictionary;
  onSubmit: (values: BookingFormValues) => void;
  onBack: () => void;
  submitting: boolean;
  serverError?: string;
}) {
  const [values, setValues] = useState<BookingFormValues>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    interestArea: dict.form.interestAreaOptions[0]?.value ?? "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!values.firstName.trim()) next.firstName = dict.form.required;
    if (!values.lastName.trim()) next.lastName = dict.form.required;
    if (!values.phone.trim()) next.phone = dict.form.required;
    else if (!isValidPhoneNumber(values.phone)) next.phone = dict.form.invalidPhone;
    if (!values.email.trim()) next.email = dict.form.required;
    else if (!emailRegex.test(values.email)) next.email = dict.form.invalidEmail;
    if (!values.consent) next.consent = dict.form.consentRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (validate()) onSubmit(values);
      }}
    >
      {serverError && <Alert tone="error">{serverError}</Alert>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={dict.form.firstName}
          required
          value={values.firstName}
          onChange={(e) => setValues((v) => ({ ...v, firstName: e.target.value }))}
          error={errors.firstName}
        />
        <Input
          label={dict.form.lastName}
          required
          value={values.lastName}
          onChange={(e) => setValues((v) => ({ ...v, lastName: e.target.value }))}
          error={errors.lastName}
        />
        <Input
          label={dict.form.phone}
          required
          type="tel"
          placeholder="+374 XX XXXXXX"
          value={values.phone}
          onChange={(e) => setValues((v) => ({ ...v, phone: e.target.value }))}
          error={errors.phone}
        />
        <Input
          label={dict.form.email}
          required
          type="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          error={errors.email}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-navy-800">{dict.form.interestArea}</span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {dict.form.interestAreaOptions.map((opt) => (
            <Radio
              key={opt.value}
              name="interestArea"
              label={opt.label}
              value={opt.value}
              checked={values.interestArea === opt.value}
              onChange={() => setValues((v) => ({ ...v, interestArea: opt.value }))}
            />
          ))}
        </div>
      </div>

      <Checkbox
        label={dict.form.consent}
        checked={values.consent}
        onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
        error={errors.consent}
      />

      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" onClick={onBack} disabled={submitting}>
          {dict.form.back}
        </Button>
        <Button type="submit" disabled={submitting}>
          {dict.form.submit}
        </Button>
      </div>
    </form>
  );
}
