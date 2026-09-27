import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useProblemTypes, useQuestionnaires } from "@/hooks/useCatalog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

export default function Questionnaires() {
  const { t, tr } = useLang();
  const { data: qs = [] } = useQuestionnaires();
  const { data: pts = [] } = useProblemTypes();
  const [filter, setFilter] = useState("all");
  const shown = filter === "all" ? qs : qs.filter((q) => q.problem_type_id === filter);
  const chip = (active) => `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"}`;

  return (
    <>
      <PageHeader
        eyebrow={t("library")}
        title={t("nav_questionnaires")}
        action={<Button asChild className="rounded-full"><Link to="/questionnaires/new"><Plus className="mr-2 h-4 w-4" />{t("new_questionnaire")}</Link></Button>}
      />
      <div className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-1">
        <button onClick={() => setFilter("all")} className={chip(filter === "all")}>{t("all")}</button>
        {pts.map((p) => <button key={p.id} onClick={() => setFilter(p.id)} className={chip(filter === p.id)}>{tr(p.name)}</button>)}
      </div>
      {shown.length === 0 ? <EmptyState text={t("empty_list")} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((q) => (
            <Link key={q.id} to={`/questionnaires/${q.id}`} className={`group rounded-3xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-15px_rgba(30,42,37,0.25)] ${q.is_active === false ? "opacity-50" : ""}`}>
              <div className="flex items-start justify-between gap-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{tr(pts.find((p) => p.id === q.problem_type_id)?.name) || "—"}</p>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <p className="mt-3 font-heading text-2xl leading-tight">{tr(q.title)}</p>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{tr(q.description)}</p>
              <p className="mt-4 text-xs text-muted-foreground">{q.questions?.length || 0} {t("questions_count")}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}