import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useMe from "@/hooks/useMe";
import Loader from "@/components/shared/Loader";

export default function RequireClinician() {
  const { data: me, isLoading } = useMe();
  if (isLoading) return <Loader />;
  if (me?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}