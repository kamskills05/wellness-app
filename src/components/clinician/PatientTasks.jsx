import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { useTaskDefs } from "@/hooks/useCatalog";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import AssignTaskDialog from "@/components/clinician/AssignTaskDialog";
import { PatientTaskAssignment } from "@/api/entities";

export default function PatientTasks({ patient }) {
  const { t, tr, fmt } = useLang();
  const qc = useQueryClient();
  const { data: assignments = [] } = useQuery({
    queryKey: ["assignments", patient.id],
    queryFn: () => PatientTaskAssignment.filter({ patient_user_id: patient.id }, "-created_date"),
  });
  const { data: defs = [] } = useTaskDefs();

  const setStatus = async (a, status) => {
    await PatientTaskAssignment.update(a.id, { status });
    qc.invalidateQueries({ queryKey: ["assignments", patient.id] });
    qc.invalidateQueries({ queryKey: ["allAssignments"] });
  };

  return (
    <div>
      <div className="mb-5 flex justify-end"><AssignTaskDialog patient={patient} /></div>
      {assignments.length === 0 ? <EmptyState text={t("no_assignments")} /> : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const d = defs.find((x) => x.id === a.task_definition_id);
            return (
              <div key={a.id} className={`rounded-2xl border bg-card p-5 transition ${a.status === "archived" ? "opacity-60" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-heading text-xl">{tr(d?.name)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {d && t(`type_${d.task_type}`)} · {t(`freq_${a.frequency}`)} · {fmt(a.start_date)}{a.end_date && ` → ${fmt(a.end_date)}`}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                {a.reason && <p className="mt-3 text-sm"><span className="text-muted-foreground">{t("why")}: </span>{a.reason}</p>}
                {a.notes_clinician && <p className="mt-1 text-sm italic text-muted-foreground">{a.notes_clinician}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  {a.status === "active" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(a, "paused")}>{t("pause")}</Button>}
                  {a.status === "paused" && <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(a, "active")}>{t("resume")}</Button>}
                  {a.status !== "archived" && <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setStatus(a, "archived")}>{t("archive")}</Button>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}