import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import EmptyState from "@/components/shared/EmptyState";

export default function PatientList({ patients, assignments }) {
  const { t } = useLang();
  const [q, setQ] = useState("");
  const shown = patients.filter((p) => `${p.full_name || ""} ${p.email}`.toLowerCase().includes(q.toLowerCase()));
  const activeCount = (id) => assignments.filter((a) => a.patient_user_id === id && a.status === "active").length;

  return (
    <section>
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="h-11 rounded-full bg-card pl-10" />
      </div>
      {shown.length === 0 ? (
        <EmptyState text={t("no_patients")} />
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-3xl border bg-card">
          {shown.map((p) => (
            <li key={p.id}>
              <Link to={`/patients/${p.id}`} className="group flex items-center gap-4 px-5 py-4 transition hover:bg-secondary/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-accent-foreground">
                  {(p.full_name || p.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.full_name || p.email}</p>
                  <p className="truncate text-sm text-muted-foreground">{p.email}</p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {activeCount(p.id)} {t("active_tasks")}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}