import React from "react";
import { Link } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { ShieldCheck } from "lucide-react";

// Base44 MCP consent is not available off-platform. Not registered in the router.
export default function OAuthConsent() {
  return (
    <AuthLayout
      icon={ShieldCheck}
      title="Not available"
      subtitle="App MCP authorization is not hosted on this deployment."
      footer={
        <Link to="/" className="text-primary font-medium hover:underline">
          Back home
        </Link>
      }
    >
      <p className="text-sm text-center text-muted-foreground">
        There is no MCP server or consent endpoint on Vercel/Supabase for this app.
      </p>
    </AuthLayout>
  );
}
