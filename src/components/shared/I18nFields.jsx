import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/lib/i18n";

export default function I18nFields({ label, value, onChange, multiline }) {
  const [active, setActive] = useState("es");
  const v = value || {};
  const Field = multiline ? Textarea : Input;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>{label}</Label>
        <div className="flex gap-0.5 rounded-full bg-secondary p-0.5">
          {LANGUAGES.map((l) => (
            <button
              type="button"
              key={l.code}
              onClick={() => setActive(l.code)}
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all ${
                active === l.code ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.short}
              {v[l.code] && <span className="h-1 w-1 rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>
      <Field
        value={v[active] || ""}
        onChange={(e) => onChange({ ...v, [active]: e.target.value })}
        placeholder={active !== "es" ? v.es || "" : ""}
        className="bg-card"
      />
    </div>
  );
}