import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/lib/i18n";
import { useProblemTypes, useQuestionnaires } from "@/hooks/useCatalog";
import EmptyState from "@/components/shared/EmptyState";
import SubmissionCard from "@/components/clinician/SubmissionCard";
import { Submission, SensationNote } from "@/api/entities";

export default function PatientActivity({ patient }) {
  const { t, tr, fmt } = useLang();
  const { data: subs = [] } = useQuery({
    queryKey: ["subs", patient.id],
    queryFn: () => Submission.filter({ patient_user_id: patient.id }, "-created_date"),
  });
  const { data: notes = [] } = useQuery({
    queryKey: ["notes", patient.id],
    queryFn: () => SensationNote.filter({ patient_user_id: patient.id }, "-created_date"),
  });
  const { data: qs = [] } = useQuestionnaires();
  const { data: pts = [] } = useProblemTypes();

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h3 className="mb-4 font-heading text-2xl">{t("submissions")}</h3>
        {subs.length === 0 ? <EmptyState text={t("empty_list")} /> : (
          <div className="space-y-3">
            {subs.map((s) => <SubmissionCard key={s.id} submission={s} questionnaire={qs.find((q) => q.id === s.questionnaire_id)} />)}
          </div>
        )}
      </section>
      <section>
        <h3 className="mb-4 font-heading text-2xl">{t("type_note_prompt")}</h3>
        {notes.length === 0 ? <EmptyState text={t("no_notes")} /> : (
          <div className="space-y-3">
            {notes.map((n) => (
              <article key={n.id} className="rounded-2xl border bg-card p-5">
                <p className="mb-2 text-xs text-muted-foreground">
                  {fmt(n.created_date, "d MMM yyyy · HH:mm")} · {tr(pts.find((p) => p.id === n.problem_type_id)?.name) || t("general")}
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{n.note_text}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}