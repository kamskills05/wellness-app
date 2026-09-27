import React from "react";
import useMe from "@/hooks/useMe";
import Loader from "@/components/shared/Loader";
import Dashboard from "@/pages/clinician/Dashboard";
import PatientHome from "@/pages/patient/PatientHome";

export default function Home() {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <Loader />;
  return me?.role === "admin" ? <Dashboard /> : <PatientHome />;
}