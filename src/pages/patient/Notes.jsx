import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "@/lib/i18n";
import useMe from "@/hooks/useMe";
import { useMyAssignments, useProblemTypes, useTaskDefs } from "@/hooks/useCatalog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import NoteForm from "@/components/patient/NoteForm";
import { SensationNote } from "@/api/entities";

export default function Notes() {
  const { t, tr, fmt, lang } = useLang();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const [selected, setSelected] = useState(new URLSearchParams(window.location.search).get("problem") || "general");
  const { data: assignments = [] } = useMyAssignments(me?.id);
  const { data: defs = [] } = useTaskDefs();
  const { data: pts = [] } = useProblemTypes();
  const { data: notes = [] } = useQuery({
    queryKey: ["myNotes", me?.id],
    queryFn: () => SensationNote.filter({ patient_user_id: me.id }, "-created_date"),
    enabled: !!me,
  });

  const allowedIds = assignments
    .map((a) => defs.find((d) => d.id === a.task_definition_id))
    .filter((d) => d?.task_type === "note_prompt" && d.linked_problem_type_id)
    .map((d) => d.linked_problem_type_id);
  const sections = pts.filter((p) => allowedIds.includes(p.id));
  const current = sections.some((p) => p.id === selected) ? selected : "general";
  const shown = notes.filter((n) => (current === "general" ? !n.problem_type_id : n.problem_type_id === current));
  const chip = (active) => `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/40"}`;

  const save = async (text) => {
    await SensationNote.create({
      patient_user_id: me.id,
      problem_type_id: current === "general" ? undefined : current,
      note_text: text,
      language: lang,
    });
    qc.invalidateQueries({ queryKey: ["myNotes", me.id] });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader eyebrow={t("nav_notes")} title={t("type_note_prompt")} subtitle={t("notes_sub")} />
      <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1">
        <button onClick={() => setSelected("general")} className={chip(current === "general")}>{t("general")}</button>
        {sections.map((p) => <button key={p.id} onClick={() => setSelected(p.id)} className={chip(current === p.id)}>{tr(p.name)}</button>)}
      </div>
      <NoteForm onSave={save} />
      <div className="mt-10 space-y-4">
        {shown.length === 0 ? <EmptyState text={t("no_notes")} /> : (
          <AnimatePresence initial={false}>
            {shown.map((n) => (
              <motion.article key={n.id} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="border-l-2 border-primary/30 pl-5">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{fmt(n.created_date, "EEEE d MMM · HH:mm")}</p>
                <p className="mt-2 whitespace-pre-wrap leading-relaxed">{n.note_text}</p>
              </motion.article>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}