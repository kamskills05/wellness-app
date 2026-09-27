import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import { useProblemTypes, useQuestionnaires } from "@/hooks/useCatalog";
import I18nFields from "@/components/shared/I18nFields";
import { TaskDefinition } from "@/api/entities";

export default function TaskDialog({ item, trigger }) {
  const { t, tr } = useLang();
  const qc = useQueryClient();
  const { data: qs = [] } = useQuestionnaires();
  const { data: pts = [] } = useProblemTypes();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onOpen = (o) => {
    setOpen(o);
    if (o) setForm({
      name: item?.name || {}, description: item?.description || {}, task_type: item?.task_type || "questionnaire",
      linked_questionnaire_id: item?.linked_questionnaire_id || "none", linked_problem_type_id: item?.linked_problem_type_id || "none",
      is_active: item?.is_active !== false,
    });
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const q = qs.find((x) => x.id === form.linked_questionnaire_id);
    const data = {
      ...form,
      linked_questionnaire_id: form.task_type === "questionnaire" && q ? q.id : "",
      linked_problem_type_id: form.task_type === "questionnaire" ? q?.problem_type_id || "" : form.linked_problem_type_id === "none" ? "" : form.linked_problem_type_id,
    };
    if (item) await TaskDefinition.update(item.id, data);
    else await TaskDefinition.create(data);
    qc.invalidateQueries({ queryKey: ["taskDefs"] });
    setSaving(false);
    setOpen(false);
  };
  const remove = async () => {
    if (!window.confirm(t("confirm_delete"))) return;
    await TaskDefinition.delete(item.id);
    qc.invalidateQueries({ queryKey: ["taskDefs"] });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-2xl font-normal">{item ? tr(item.name) : t("new_task")}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-5">
          <I18nFields label={t("name")} value={form.name} onChange={(name) => set({ name })} />
          <I18nFields label={t("description")} value={form.description} onChange={(description) => set({ description })} multiline />
          <div className="space-y-2">
            <Label>{t("task_type")}</Label>
            <Select value={form.task_type} onValueChange={(task_type) => set({ task_type })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["questionnaire", "note_prompt", "module", "custom"].map((k) => <SelectItem key={k} value={k}>{t(`type_${k}`)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {form.task_type === "questionnaire" ? (
            <div className="space-y-2">
              <Label>{t("linked_questionnaire")}</Label>
              <Select value={form.linked_questionnaire_id} onValueChange={(v) => set({ linked_questionnaire_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("none")}</SelectItem>
                  {qs.map((q) => <SelectItem key={q.id} value={q.id}>{tr(q.title)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{t("linked_problem")}</Label>
              <Select value={form.linked_problem_type_id} onValueChange={(v) => set({ linked_problem_type_id: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("none")}</SelectItem>
                  {pts.map((p) => <SelectItem key={p.id} value={p.id}>{tr(p.name)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <label className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-sm">
            {t("active")}
            <Switch checked={form.is_active} onCheckedChange={(is_active) => set({ is_active })} />
          </label>
          <div className="flex gap-2">
            {item && <Button type="button" variant="ghost" className="rounded-full text-destructive" onClick={remove}>{t("delete")}</Button>}
            <Button type="submit" disabled={saving || !form.name?.es || (form.task_type === "questionnaire" && form.linked_questionnaire_id === "none")} className="flex-1 rounded-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}