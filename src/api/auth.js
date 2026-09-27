import { supabase } from "./supabaseClient";
import { mapRow, throwIfError } from "./helpers";

function redirectBase() {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

async function mergeMe() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
  if (sessionError || !sessionData?.user) {
    const err = new Error("Authentication required");
    err.status = 401;
    throw err;
  }
  const user = sessionData.user;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return mapRow({
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
    role: profile?.role || "user",
    language_preference: profile?.language_preference || "es",
    created_at: profile?.created_at || user.created_at,
    ...profile,
  });
}

export const auth = {
  me: mergeMe,

  async loginViaEmailPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    throwIfError(error);
    return mergeMe();
  },

  async register({ email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${redirectBase()}/` },
    });
    throwIfError(error);
    return { ok: true, session: data?.session || null };
  },

  async verifyOtp({ email, otpCode }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "signup",
    });
    throwIfError(error);
    return { access_token: data?.session?.access_token };
  },

  async resendOtp(email) {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    throwIfError(error);
  },

  setToken() {
    // Session is persisted by supabase-js; no-op for compatibility.
  },

  async loginWithProvider(provider, returnTo = "/") {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectBase()}${returnTo === "/" ? "/" : returnTo}`,
      },
    });
    throwIfError(error);
  },

  async resetPasswordRequest(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectBase()}/reset-password`,
    });
    throwIfError(error);
  },

  async resetPassword({ newPassword }) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    throwIfError(error);
  },

  async updateMe(fields) {
    const { data: sessionData } = await supabase.auth.getUser();
    if (!sessionData?.user) return null;
    const { error } = await supabase.from("profiles").update(fields).eq("id", sessionData.user.id);
    throwIfError(error);
    return mergeMe();
  },

  async logout() {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },

  redirectToLogin() {
    if (typeof window !== "undefined") window.location.href = "/login";
  },
};

export const users = {
  async inviteUser(email, role = "user") {
    const { data: sessionData } = await supabase.auth.getUser();
    const { error } = await supabase.from("pending_invites").insert({
      email,
      role,
      invited_by: sessionData?.user?.id || null,
    });
    throwIfError(error);
    return { email, role };
  },
};
