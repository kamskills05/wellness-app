import React, { useState } from "react";
import { UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLang } from "@/lib/i18n";
import { users } from "@/api/auth";

export default function InvitePatientDialog() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await users.inviteUser(email.trim(), "user");
      setSent(email.trim());
      setEmail("");
    } catch (err) {
      setError(err?.message || "Error");
    }
    setSending(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); setSent(""); setError(""); }}>
      <DialogTrigger asChild>
        <Button className="rounded-full px-5"><UserPlus className="mr-2 h-4 w-4" />{t("invite_patient")}</Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl font-normal">{t("invite_patient")}</DialogTitle>
          <DialogDescription>{t("invite_sub")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 pt-2">
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email")} className="h-11" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          {sent && (
            <p className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" /> {t("invite_sent")} {sent}
            </p>
          )}
          <Button type="submit" disabled={sending} className="w-full rounded-full">
            {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("send_invite")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}