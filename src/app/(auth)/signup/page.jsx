"use client";

// Signup / accept-invite page.
//
// Entry: /signup?token=...&email=...&role=...&first_name=...&last_name=...
// Or:    /signup (from login page "Have an invite?" link — user enters email manually)
//
// Backend accept-invite.php matches email against pending invites.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { persistLoginResponse, landingPathForUser } from "@/lib/user";

const ROLE_HEADINGS = {
  super_admin:   "Super-Admin",
  trainer_admin: "Trainer-Admin",
  trainer:       "Trainer",
  client:        "Client",
};

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const role = searchParams.get("role") || "";
  const firstName = searchParams.get("first_name") || "";
  const lastName = searchParams.get("last_name") || "";
  const prefilledEmail = searchParams.get("email") || "";
  const hasToken = Boolean(token);

  const displayName = firstName || "there";
  const roleLabel = ROLE_HEADINGS[role] || "";

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email.trim())) return toast.error("Please enter a valid email address.");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");

    setSubmitting(true);
    try {
      const payload = {
        token,
        password,
        confirm_password: confirm,
      };

      const res = await fetch("/api/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!res.ok || result?.ok === false || result?.success === false) {
        throw { data: result, message: result?.error || result?.message || `Request failed (${res.status})` };
      }

      const responseData = result?.data || result;

      const loginPayload = {
        access_token: responseData.access_token,
        user: responseData.user || {
          user_id: responseData.user_id || `local-${Date.now()}`,
          role: responseData.role || role || "trainer",
          first_name: responseData.first_name || firstName,
          last_name: responseData.last_name || lastName,
          email: responseData.email || email.trim(),
          partner_code: responseData.partner_code || null,
          parent_user_id: responseData.parent_user_id || null,
          is_reset_password: 1,
          email_verified_at: responseData.email_verified_at || new Date().toISOString(),
        },
      };

      persistLoginResponse(loginPayload);
      toast.success(`Welcome aboard, ${firstName || ""}! You're all set.`);
      const home = landingPathForUser(loginPayload.user);
      router.push(home);
    } catch (err) {
      const msg = err?.data?.message || err?.message || "";
      const lower = msg.toLowerCase();
      if (lower.includes("already accepted") || lower.includes("already registered") || lower.includes("already onboarded")) {
        toast.error("This invite has already been accepted. Please sign in instead.");
        router.push("/");
        return;
      } else if (lower.includes("no pending invite") || lower.includes("not found")) {
        toast.error("No pending invitation found for this email. Please check with the person who invited you.");
      } else {
        toast.error(msg || "Could not create your account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9] transition-colors";
  const labelClass = "text-[#535359] text-[12px] font-semibold";

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-[12px] p-8 max-w-md w-full flex flex-col gap-5">
      <div>
        <h2 className="text-[28px] font-bold text-[#252525] tracking-[-0.5px]">
          Hi {displayName}! 👋
        </h2>
        {roleLabel && (
          <p className="text-[#535359] text-[13px] mt-1">
            You've been invited as a <span className="font-semibold text-[#308BF9]">{roleLabel}</span> on Respyr.
          </p>
        )}
        {!roleLabel && !hasToken && (
          <p className="text-[#535359] text-[13px] mt-1">
            Enter your email to accept your invitation and get started.
          </p>
        )}
        <p className="text-[#A1A1A1] text-[11px] mt-3">
          Confirm your email and set a password to complete your account.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Email <span className="text-red-500">*</span></label>
        {prefilledEmail ? (
          <input className={`${fieldClass} bg-[#F5F7FA]`} value={email} readOnly />
        ) : (
          <input
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            inputMode="email"
          />
        )}
        {!prefilledEmail && (
          <span className="text-[#A1A1A1] text-[11px]">Must match the email on your invitation.</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Password <span className="text-red-500">*</span></label>
        <input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Confirm password <span className="text-red-500">*</span></label>
        <input className={fieldClass} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[10px] bg-[#308BF9] text-white text-[14px] font-semibold py-3 disabled:opacity-60 hover:bg-[#1a76e8] transition-colors cursor-pointer"
      >
        {submitting ? "Setting up your account..." : "Create account"}
      </button>

      <p className="text-[#A1A1A1] text-[11px] text-center">
        Already have an account? <Link href="/" className="text-[#308BF9] font-semibold">Log in</Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-svh w-full flex items-center justify-center p-6 bg-[#F5F7FA]">
      <Suspense fallback={<div className="text-[#A1A1A1] text-[13px]">Loading…</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
