import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLang } from "@/lib/i18n";

export default function SubmissionCard({ submission, questionnaire }) {
  const { t, tr, fmt } = useLang();
  const [open, setOpen] = useState(false);
  const answers = submission.answers || [];
  const likerts = answers.filter((a) => typeof a.likert_value === "number");
  const total = likerts.reduce((sum, a) => sum + a.likert_value, 0);
  const qText = (id) => tr(questionnaire?.questions?.find((q) => q.id === id)?.text);

  return (
    <article className="rounded-2xl border bg-card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <div className="min-w-0">
          <p className="truncate font-medium">{tr(questionnaire?.title) || "—"}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{fmt(submission.created_date, "d MMM yyyy · HH:mm")}</p>
        </div>
        <div className="flex items-center gap-3">
          {likerts.length > 0 && (
            <span className="font-heading text-2xl text-primary">
              {total}<span className="ml-1 text-xs font-body text-muted-foreground">{t("score")}</span>
            </span>
          )}
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && (
        <ul className="space-y-3 border-t px-5 py-4">
          {answers.map((a) => (
            <li key={a.question_id} className="flex items-start justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{qText(a.question_id)}</span>
              <span className="shrink-0 font-medium">
                {typeof a.likert_value === "number" ? a.likert_value : <span className="whitespace-pre-wrap font-normal">{a.text_value || "—"}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}