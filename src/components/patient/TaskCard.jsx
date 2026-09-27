import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardList, PenLine, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

const ICONS = { questionnaire: ClipboardList, note_prompt: PenLine, module: BookOpen, custom: Sparkles };

export default function TaskCard({ assignment, def, lastDone, index }) {
  const { t, tr, fmt } = useLang();
  const Icon = ICONS[def.task_type] || Sparkles;
  const href =
    def.task_type === "questionnaire" ? `/questionnaire/${def.linked_questionnaire_id}?assignment=${assignment.id}`
    : def.task_type === "note_prompt" ? `/notes${def.linked_problem_type_id ? `?problem=${def.linked_problem_type_id}` : ""}`
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col rounded-3xl border bg-card p-6 transition hover:shadow-[0_12px_40px_-18px_rgba(30,42,37,0.25)] sm:p-7"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-primary"><Icon className="h-5 w-5" /></div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {t(`type_${def.task_type}`)} · {t(`freq_${assignment.frequency}`)}
        </p>
      </div>
      <h3 className="mt-5 font-heading text-2xl leading-tight">{tr(def.name)}</h3>
      {tr(def.description) && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tr(def.description)}</p>}
      {assignment.reason && (
        <p className="mt-4 rounded-2xl bg-secondary/70 px-4 py-3 text-sm"><span className="text-muted-foreground">{t("why")}: </span>{assignment.reason}</p>
      )}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
        {def.task_type === "questionnaire" ? (
          <span className="text-xs text-muted-foreground">{t("last_done")}: {lastDone ? fmt(lastDone) : t("never")}</span>
        ) : <span />}
        {href ? (
          <Button asChild className="group rounded-full px-5">
            <Link to={href}>
              {def.task_type === "questionnaire" ? t("complete_now") : t("add_notes")}
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </Button>
        ) : (
          <span className="text-sm italic text-muted-foreground">{t("module_hint")}</span>
        )}
      </div>
    </motion.article>
  );
}