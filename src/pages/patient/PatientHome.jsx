import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/lib/i18n";
import useMe from "@/hooks/useMe";
import { useMyAssignments, useTaskDefs } from "@/hooks/useCatalog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import Loader from "@/components/shared/Loader";
import TaskCard from "@/components/patient/TaskCard";
import { Submission } from "@/api/entities";

export default function PatientHome() {
  const { t } = useLang();
  const { data: me } = useMe();
  const { data: assignments = [], isLoading } = useMyAssignments(me?.id);
  const { data: defs = [] } = useTaskDefs();
  const { data: subs = [] } = useQuery({
    queryKey: ["mySubs", me?.id],
    queryFn: () => Submission.filter({ patient_user_id: me.id }, "-created_date", 200),
    enabled: !!me,
  });
  const firstName = (me?.full_name || "").split(" ")[0];
  const items = assignments.map((a) => ({ a, d: defs.find((d) => d.id === a.task_definition_id) })).filter((x) => x.d);

  return (
    <>
      <PageHeader eyebrow={t("my_tasks")} title={`${t("hello")}${firstName ? `, ${firstName}` : ""}.`} subtitle={t("patient_home_sub")} />
      {isLoading ? <Loader /> : items.length === 0 ? <EmptyState text={t("no_tasks")} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map(({ a, d }, i) => (
            <TaskCard
              key={a.id}
              index={i}
              assignment={a}
              def={d}
              lastDone={subs.find((s) => s.questionnaire_id === d.linked_questionnaire_id)?.created_date}
            />
          ))}
        </div>
      )}
    </>
  );
}