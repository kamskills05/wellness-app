import React, { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import { useTaskDefs } from "@/hooks/useCatalog";
import { PatientTaskAssignment } from "@/api/entities";

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { task_definition_id: "", reason: "", status: "active", start_date: today(), end_date: "", frequency: "weekly", notes_clinician: "" };

export default function AssignTaskDialog({ patient }) {
  const { t, tr } = useLang();
  const qc = useQueryClient();
  const { data: defs = [] } = useTaskDefs();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v?.target ? v.target.value : v }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await PatientTaskAssignment.create({
      ...form,
      end_date: form.end_date || undefined,
      patient_user_id: patient.id,
      patient_email: patient.email,
    });
    qc.invalidateQueries({ queryKey: ["assignments", patient.id] });
    qc.invalidateQueries({ queryKey: ["allAssignments"] });
    setSaving(false);
    setOpen(false);
    setForm(EMPTY);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full"><Plus className="mr-2 h-4 w-4" />{t("assign_task")}</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-2xl font-normal">{t("assign_task")}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("task")}</Label>
            <Select value={form.task_definition_id} onValueChange={set("task_definition_id")}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                {defs.filter((d) => d.is_active !== false).map((d) => <SelectItem key={d.id} value={d.id}>{tr(d.name)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>{t("why")}</Label><Textarea value={form.reason} onChange={set("reason")} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("frequency")}</Label>
              <Select value={form.frequency} onValueChange={set("frequency")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["once", "daily", "weekly", "custom"].map((f) => <SelectItem key={f} value={f}>{t(`freq_${f}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <Select value={form.status} onValueChange={set("status")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["active", "paused"].map((s) => <SelectItem key={s} value={s}>{t(`status_${s}`)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{t("start_date")}</Label><Input type="date" value={form.start_date} onChange={set("start_date")} /></div>
            <div className="space-y-2"><Label>{t("end_date")}</Label><Input type="date" value={form.end_date} onChange={set("end_date")} /></div>
          </div>
          <div className="space-y-2"><Label>{t("clinician_notes")}</Label><Textarea value={form.notes_clinician} onChange={set("notes_clinician")} /></div>
          <Button type="submit" disabled={saving || !form.task_definition_id} className="w-full rounded-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("assign_task")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}