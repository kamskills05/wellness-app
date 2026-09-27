import React from "react";
import { Plus, ClipboardList, PenLine, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useTaskDefs } from "@/hooks/useCatalog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import TaskDialog from "@/components/clinician/TaskDialog";

export const TASK_ICONS = { questionnaire: ClipboardList, note_prompt: PenLine, module: BookOpen, custom: Sparkles };

export default function TaskLibrary() {
  const { t, tr } = useLang();
  const { data: defs = [] } = useTaskDefs();

  return (
    <>
      <PageHeader
        eyebrow={t("library")}
        title={t("nav_tasks")}
        action={<TaskDialog trigger={<Button className="rounded-full"><Plus className="mr-2 h-4 w-4" />{t("new_task")}</Button>} />}
      />
      {defs.length === 0 ? <EmptyState text={t("empty_list")} /> : (
        <div className="grid gap-3 sm:grid-cols-2">
          {defs.map((d) => {
            const Icon = TASK_ICONS[d.task_type] || Sparkles;
            return (
              <TaskDialog
                key={d.id}
                item={d}
                trigger={
                  <button className={`flex items-start gap-4 rounded-3xl border bg-card p-6 text-left transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-15px_rgba(30,42,37,0.25)] ${d.is_active === false ? "opacity-50" : ""}`}>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{t(`type_${d.task_type}`)}</p>
                      <p className="mt-1.5 font-heading text-xl leading-tight">{tr(d.name)}</p>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{tr(d.description)}</p>
                    </div>
                  </button>
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
}