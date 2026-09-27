import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useLang } from "@/lib/i18n";

export default function NoteForm({ onSave }) {
  const { t } = useLang();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(text.trim());
    setText("");
    setSaving(false);
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border bg-card p-5 sm:p-6">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("note_placeholder")}
        className="min-h-[140px] resize-none border-0 bg-transparent p-0 font-heading text-lg shadow-none focus-visible:ring-0"
      />
      <div className="mt-4 flex justify-end">
        <Button type="submit" disabled={saving || !text.trim()} className="rounded-full px-6">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{t("save_note")}
        </Button>
      </div>
    </form>
  );
}