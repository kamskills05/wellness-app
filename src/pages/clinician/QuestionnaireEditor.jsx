import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang } from "@/lib/i18n";
import { useProblemTypes } from "@/hooks/useCatalog";
import PageHeader from "@/components/shared/PageHeader";
import Loader from "@/components/shared/Loader";
import I18nFields from "@/components/shared/I18nFields";
import QuestionEditor from "@/components/clinician/QuestionEditor";
import { Questionnaire } from "@/api/entities";

const EMPTY = { title: {}, description: {}, problem_type_id: "", is_active: true, questions: [] };

export default function QuestionnaireEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { t, tr } = useLang();
  const { data: pts = [] } = useProblemTypes();
  const [form, setForm] = useState(isNew ? EMPTY : null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew) Questionnaire.filter({ id }).then((r) => setForm({ ...EMPTY, ...r[0] }));
  }, [id, isNew]);

  if (!form) return <Loader />;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const qs = form.questions || [];
  const updateQ = (i, q) => set({ questions: qs.map((x, j) => (j === i ? q : x)) });
  const moveQ = (i, dir) => {
    const next = [...qs];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    set({ questions: next });
  };
  const addQ = () =>
    set({ questions: [...qs, { id: crypto.randomUUID(), text: {}, question_type: "likert", likert_min: 1, likert_max: 5, likert_labels: {} }] });

  const save = async () => {
    setSaving(true);
    const data = { title: form.title, description: form.description, problem_type_id: form.problem_type_id, is_active: form.is_active, questions: qs };
    if (isNew) await Questionnaire.create(data);
    else await Questionnaire.update(id, data);
    qc.invalidateQueries({ queryKey: ["questionnaires"] });
    navigate("/questionnaires");
  };
  const remove = async () => {
    if (!window.confirm(t("confirm_delete"))) return;
    await Questionnaire.delete(id);
    qc.invalidateQueries({ queryKey: ["questionnaires"] });
    navigate("/questionnaires");
  };

  return (
    <>
      <Link to="/questionnaires" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>
      <PageHeader
        eyebrow={t("type_questionnaire")}
        title={isNew ? t("new_questionnaire") : tr(form.title) || t("new_questionnaire")}
        action={
          <div className="flex gap-2">
            {!isNew && <Button variant="ghost" className="rounded-full" onClick={remove}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
            <Button onClick={save} disabled={saving || !form.title?.es} className="rounded-full px-6">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("save")}
            </Button>
          </div>
        }
      />
      <div className="mb-12 space-y-5 rounded-3xl border bg-card p-6 sm:p-8">
        <I18nFields label={t("title")} value={form.title} onChange={(title) => set({ title })} />
        <I18nFields label={t("description")} value={form.description} onChange={(description) => set({ description })} multiline />
        <p className="text-xs text-muted-foreground">{t("translations_hint")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("problem_type")}</Label>
            <Select value={form.problem_type_id || ""} onValueChange={(problem_type_id) => set({ problem_type_id })}>
              <SelectTrigger className="bg-card"><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>{pts.map((p) => <SelectItem key={p.id} value={p.id}>{tr(p.name)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <label className="flex items-center justify-between self-end rounded-2xl bg-secondary px-4 py-2.5 text-sm">
            {t("active")}
            <Switch checked={form.is_active !== false} onCheckedChange={(is_active) => set({ is_active })} />
          </label>
        </div>
      </div>
      <h2 className="mb-5 font-heading text-3xl font-light">{t("questions")}</h2>
      <div className="space-y-4">
        {qs.map((q, i) => (
          <QuestionEditor key={q.id} q={q} index={i} total={qs.length} onChange={(nq) => updateQ(i, nq)} onMove={(d) => moveQ(i, d)} onRemove={() => set({ questions: qs.filter((_, j) => j !== i) })} />
        ))}
      </div>
      <button onClick={addQ} className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed py-6 text-sm text-muted-foreground transition hover:border-primary/50 hover:text-foreground">
        <Plus className="h-4 w-4" /> {t("add_question")}
      </button>
    </>
  );
}