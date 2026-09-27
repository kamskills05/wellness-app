import React from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/lib/i18n";
import PageHeader from "@/components/shared/PageHeader";
import Loader from "@/components/shared/Loader";
import EmptyState from "@/components/shared/EmptyState";
import PatientProfile from "@/components/clinician/PatientProfile";
import PatientActivity from "@/components/clinician/PatientActivity";
import PatientTasks from "@/components/clinician/PatientTasks";
import { User } from "@/api/entities";

const TAB = "rounded-full px-4 py-1.5 data-[state=active]:bg-card data-[state=active]:shadow-sm";

export default function PatientDetail() {
  const { id } = useParams();
  const { t } = useLang();
  const { data: patient, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => (await User.filter({ id }))[0] || null,
  });

  if (isLoading) return <Loader />;
  if (!patient) return <EmptyState text={t("not_found")} />;

  return (
    <>
      <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> {t("back")}
      </Link>
      <PageHeader eyebrow={t("patient")} title={patient.full_name || patient.email} subtitle={patient.full_name ? patient.email : null} />
      <Tabs defaultValue="activity">
        <TabsList className="mb-8 h-auto flex-wrap rounded-full bg-secondary p-1">
          <TabsTrigger value="profile" className={TAB}>{t("profile")}</TabsTrigger>
          <TabsTrigger value="activity" className={TAB}>{t("activity")}</TabsTrigger>
          <TabsTrigger value="tasks" className={TAB}>{t("prescribed")}</TabsTrigger>
        </TabsList>
        <TabsContent value="profile"><PatientProfile patient={patient} /></TabsContent>
        <TabsContent value="activity"><PatientActivity patient={patient} /></TabsContent>
        <TabsContent value="tasks"><PatientTasks patient={patient} /></TabsContent>
      </Tabs>
    </>
  );
}