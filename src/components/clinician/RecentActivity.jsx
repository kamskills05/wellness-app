import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/lib/i18n";
import { useQuestionnaires } from "@/hooks/useCatalog";
import { Submission, SensationNote } from "@/api/entities";

export default function RecentActivity({ patients }) {
  const { t, tr, ago } = useLang();
  const { data: subs = [] } = useQuery({ queryKey: ["recentSubs"], queryFn: () => Submission.list("-created_date", 8) });
  const { data: notes = [] } = useQuery({ queryKey: ["recentNotes"], queryFn: () => SensationNote.list("-created_date", 8) });
  const { data: qs = [] } = useQuestionnaires();
  const name = (id) => {
    const p = patients.find((x) => x.id === id);
    return p ? p.full_name || p.email : t("patient");
  };
  const items = [...subs.map((s) => ({ ...s, kind: "sub" })), ...notes.map((n) => ({ ...n, kind: "note" }))]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);

  return (
    <section>
      <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t("recent_activity")}</h2>
      {items.length === 0 ? (
        <p className="font-heading italic text-muted-foreground">{t("no_activity")}</p>
      ) : (
        <ol className="relative space-y-6 border-l border-border pl-6">
          {items.map((it) => (
            <li key={it.id} className="relative">
              <span className={`absolute -left-[29px] top-1.5 h-2 w-2 rounded-full ${it.kind === "sub" ? "bg-primary" : "bg-accent-foreground/60"}`} />
              <Link to={`/patients/${it.patient_user_id}`} className="block text-sm leading-relaxed hover:text-primary">
                <span className="font-medium">{name(it.patient_user_id)}</span>{" "}
                <span className="text-muted-foreground">
                  {it.kind === "sub" ? `${t("completed_q")} ` : t("wrote_note")}
                </span>
                {it.kind === "sub" && <span className="italic">{tr(qs.find((q) => q.id === it.questionnaire_id)?.title)}</span>}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">{ago(it.created_date)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}