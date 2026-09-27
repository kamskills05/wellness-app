import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import I18nFields from "@/components/shared/I18nFields";
import { ProblemType } from "@/api/entities";

export default function ProblemTypeDialog({ item, trigger }) {
  const { t } = useLang();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const onOpen = (o) => {
    setOpen(o);
    if (o) setForm({ name: item?.name || {}, slug: item?.slug || "", active: item?.active !== false });
  };
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (item) await ProblemType.update(item.id, form);
    else await ProblemType.create(form);
    qc.invalidateQueries({ queryKey: ["problemTypes"] });
    setSaving(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-2xl font-normal">{t("problem_type")}</DialogTitle></DialogHeader>
        <form onSubmit={save} className="space-y-5">
          <I18nFields label={t("name")} value={form.name} onChange={(name) => setForm({ ...form, name })} />
          <p className="-mt-3 text-xs text-muted-foreground">{t("translations_hint")}</p>
          <div className="space-y-2">
            <Label>{t("slug")}</Label>
            <Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "_") })} className="bg-card" />
          </div>
          <label className="flex items-center justify-between rounded-2xl bg-secondary px-4 py-3 text-sm">
            {t("active")}
            <Switch checked={form.active} onCheckedChange={(active) => setForm({ ...form, active })} />
          </label>
          <Button type="submit" disabled={saving || !form.name?.es || !form.slug} className="w-full rounded-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("save")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}