import React from "react";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang } from "@/lib/i18n";
import I18nFields from "@/components/shared/I18nFields";

export default function QuestionEditor({ q, index, total, onChange, onMove, onRemove }) {
  const { t } = useLang();
  const set = (patch) => onChange({ ...q, ...patch });
  const likert = q.question_type === "likert";

  return (
    <div className="space-y-4 rounded-3xl border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <span className="font-heading text-2xl italic text-muted-foreground/70">{String(index + 1).padStart(2, "0")}</span>
        <div className="flex gap-1">
          <Button type="button" size="icon" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp className="h-4 w-4" /></Button>
          <Button type="button" size="icon" variant="ghost" disabled={index === total - 1} onClick={() => onMove(1)}><ArrowDown className="h-4 w-4" /></Button>
          <Button type="button" size="icon" variant="ghost" onClick={onRemove}><Trash2 className="h-4 w-4 text-destructive" /></Button>
        </div>
      </div>
      <I18nFields label={t("question_text")} value={q.text} onChange={(text) => set({ text })} multiline />
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[10rem] space-y-2">
          <Label>{t("question_type")}</Label>
          <Select value={q.question_type} onValueChange={(question_type) => set({ question_type })}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="likert">{t("likert")}</SelectItem>
              <SelectItem value="text">{t("text_answer")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {likert && (
          <>
            <div className="w-20 space-y-2"><Label>{t("min")}</Label><Input type="number" value={q.likert_min ?? 1} onChange={(e) => set({ likert_min: Number(e.target.value) })} /></div>
            <div className="w-20 space-y-2"><Label>{t("max")}</Label><Input type="number" value={q.likert_max ?? 5} onChange={(e) => set({ likert_max: Number(e.target.value) })} /></div>
          </>
        )}
      </div>
      {likert && (
        <div>
          <I18nFields label={t("scale_labels")} value={q.likert_labels} onChange={(likert_labels) => set({ likert_labels })} />
          <p className="mt-1.5 text-xs text-muted-foreground">{t("labels_hint")}</p>
        </div>
      )}
    </div>
  );
}