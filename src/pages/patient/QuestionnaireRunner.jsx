import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/lib/i18n";
import useMe from "@/hooks/useMe";
import { useMyAssignments, useTaskDefs } from "@/hooks/useCatalog";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";
import LikertInput from "@/components/patient/LikertInput";
import { Questionnaire, Submission } from "@/api/entities";

export default function QuestionnaireRunner() {
  const { id } = useParams();
  const assignmentId = new URLSearchParams(window.location.search).get("assignment");
  const { t, tr, lang } = useLang();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { data: questionnaire, isLoading } = useQuery({
    queryKey: ["questionnaire", id],
    queryFn: async () => (await Questionnaire.filter({ id }))[0] || null,
  });
  const { data: assignments = [], isLoading: loadingA } = useMyAssignments(me?.id);
  const { data: defs = [], isLoading: loadingD } = useTaskDefs();
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (isLoading || !me || loadingA || loadingD) return <Loader />;
  const allowed = me.role === "admin" || assignments.some((a) => defs.find((d) => d.id === a.task_definition_id)?.linked_questionnaire_id === id);
  if (!questionnaire || !allowed) return <EmptyState text={t("not_allowed")} />;

  const questions = questionnaire.questions || [];
  const answeredCount = questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length;
  const complete = questions.every((q) => q.question_type !== "likert" || typeof answers[q.id] === "number");

  const submit = async () => {
    setSaving(true);
    await Submission.create({
      patient_user_id: me.id,
      questionnaire_id: id,
      problem_type_id: questionnaire.problem_type_id || undefined,
      assignment_id: assignmentId || undefined,
      language_used: lang,
      answers: questions.map((q) =>
        q.question_type === "likert" ? { question_id: q.id, likert_value: answers[q.id] } : { question_id: q.id, text_value: answers[q.id] || "" }
      ),
    });
    qc.invalidateQueries({ queryKey: ["mySubs", me.id] });
    setSaving(false);
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check className="h-7 w-7" /></div>
        <h1 className="font-heading text-4xl font-light">{t("thanks_title")}</h1>
        <p className="mt-4 text-muted-foreground">{t("thanks_sub")}</p>
        <Button asChild className="mt-10 rounded-full px-6"><Link to="/">{t("back_home")}</Link></Button>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> {t("back")}</Link>
      <h1 className="font-heading text-4xl font-light leading-tight sm:text-5xl">{tr(questionnaire.title)}</h1>
      {tr(questionnaire.description) && <p className="mt-4 text-muted-foreground">{tr(questionnaire.description)}</p>}
      <div className="sticky top-[73px] z-10 -mx-5 mt-8 bg-background/85 px-5 py-3 backdrop-blur md:top-[65px]">
        <div className="h-1 overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full bg-primary" animate={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} transition={{ duration: 0.4 }} />
        </div>
      </div>
      <div className="mt-6 space-y-5">
        {questions.map((q, i) => (
          <motion.section key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="rounded-3xl border bg-card p-6 sm:p-7">
            <p className="mb-5 flex gap-3 text-lg leading-snug">
              <span className="font-heading italic text-muted-foreground/70">{String(i + 1).padStart(2, "0")}</span>
              <span>{tr(q.text)}</span>
            </p>
            {q.question_type === "likert" ? (
              <LikertInput min={q.likert_min ?? 1} max={q.likert_max ?? 5} labels={tr(q.likert_labels)} value={answers[q.id]} onChange={(v) => setAnswers({ ...answers, [q.id]: v })} />
            ) : (
              <Textarea value={answers[q.id] || ""} onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })} placeholder={t("your_answer")} className="min-h-[110px] bg-background" />
            )}
          </motion.section>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-3">
        {!complete && <p className="text-sm text-muted-foreground">{t("answer_all")}</p>}
        <Button onClick={submit} disabled={!complete || saving} size="lg" className="rounded-full px-10">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("submit")}
        </Button>
      </div>
    </div>
  );
}