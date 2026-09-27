import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useProblemTypes } from "@/hooks/useCatalog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import ProblemTypeDialog from "@/components/clinician/ProblemTypeDialog";

export default function ProblemTypes() {
  const { t, tr } = useLang();
  const { data: pts = [] } = useProblemTypes();

  return (
    <>
      <PageHeader
        eyebrow={t("library")}
        title={t("nav_problems")}
        action={<ProblemTypeDialog trigger={<Button className="rounded-full"><Plus className="mr-2 h-4 w-4" />{t("new_problem_type")}</Button>} />}
      />
      {pts.length === 0 ? <EmptyState text={t("empty_list")} /> : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pts.map((p) => (
            <ProblemTypeDialog
              key={p.id}
              item={p}
              trigger={
                <button className={`group rounded-3xl border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-15px_rgba(30,42,37,0.25)] ${p.active === false ? "opacity-50" : ""}`}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{p.slug}</p>
                  <p className="mt-3 font-heading text-2xl leading-tight">{tr(p.name)}</p>
                  {p.active === false && <p className="mt-2 text-xs text-muted-foreground">{t("inactive")}</p>}
                </button>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}