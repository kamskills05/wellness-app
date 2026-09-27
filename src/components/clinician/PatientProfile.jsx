import React from "react";
import { LANGUAGES, useLang } from "@/lib/i18n";

export default function PatientProfile({ patient }) {
  const { t, fmt } = useLang();
  const rows = [
    [t("name"), patient.full_name || "—"],
    [t("email"), patient.email],
    [t("language"), LANGUAGES.find((l) => l.code === (patient.language_preference || "es"))?.label],
    [t("joined"), fmt(patient.created_date)],
  ];
  return (
    <dl className="grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="bg-card px-6 py-5">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{k}</dt>
          <dd className="mt-1.5 font-heading text-xl">{v}</dd>
        </div>
      ))}
    </dl>
  );
}