import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/shared/PageHeader";
import InvitePatientDialog from "@/components/clinician/InvitePatientDialog";
import PatientList from "@/components/clinician/PatientList";
import RecentActivity from "@/components/clinician/RecentActivity";
import { User, PatientTaskAssignment } from "@/api/entities";

export default function Dashboard() {
  const { t } = useLang();
  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: () => User.list("-created_date") });
  const { data: assignments = [] } = useQuery({
    queryKey: ["allAssignments"],
    queryFn: () => PatientTaskAssignment.list(),
  });
  const patients = users.filter((u) => u.role !== "admin");

  return (
    <>
      <PageHeader eyebrow={t("clinician_space")} title={t("patients")} action={<InvitePatientDialog />} />
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <PatientList patients={patients} assignments={assignments} />
        <RecentActivity patients={patients} />
      </div>
    </>
  );
}