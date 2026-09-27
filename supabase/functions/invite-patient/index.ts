import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: "Not signed in" }, 401);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();
    if (profileError || profile?.role !== "admin") {
      return json({ error: "Only clinicians can invite patients" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    const role = body.role === "admin" ? "admin" : "user";
    const redirectTo = String(body.redirectTo || "").trim() || Deno.env.get("APP_ORIGIN") || "";
    if (!email || !email.includes("@")) {
      return json({ error: "Valid email required" }, 400);
    }

    const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { role },
      redirectTo: redirectTo || undefined,
    });
    if (inviteError) {
      return json({ error: inviteError.message }, 400);
    }

    await admin.from("pending_invites").insert({
      email,
      role,
      invited_by: userData.user.id,
    });

    return json({ ok: true, email, role });
  } catch (err) {
    return json({ error: err?.message || "Invite failed" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
