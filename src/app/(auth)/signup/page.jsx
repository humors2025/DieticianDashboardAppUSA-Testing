"use client";

// Signup completion page (Phase 2.6).
//
// Invitee lands here after clicking the verification link in their Resend email.
// URL shape (set by backend in the email template):
//   /signup?token=<one-time-token>&email=<email>&role=<role>&first_name=<x>&last_name=<y>&code_required=true
//
// Today (no backend) the page accepts those params or shows blank fields. The
// submit handler is a stub that simulates account creation by setting a fake
// `user` cookie + `access_token` and routing to the role's home. When backend
// ships POST /api/auth/verify-and-set-password, replace the stub call.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { persistLoginResponse, landingPathForUser } from "@/lib/user";

const ROLE_HEADINGS = {
  super_admin:   "Welcome Super-Admin!",
  trainer_admin: "Welcome Trainer-Admin!",
  trainer:       "Welcome Trainer!",
  client:        "Welcome!",
};

const ROLE_BLURBS = {
  super_admin:   "You've been invited to administer the Respyr program.",
  trainer_admin: "You've been invited to lead a team of trainers on Respyr.",
  trainer:       "You've been invited to onboard clients on Respyr.",
  client:        "You've been invited to start your Respyr journey.",
};

async function verifyAndSetPassword({ token, code, password, email, role, firstName, lastName }) {
  // STUB. When backend ships:
  //   POST /api/auth/verify-and-set-password { token, code, password }
  //   → { access_token, user: { id, role, first_name, ... } }
  await new Promise((r) => setTimeout(r, 500));
  return {
    ok: true,
    response: {
      access_token: "demo-token",
      user: {
        user_id: `local-${Date.now()}`,
        role,
        first_name: firstName,
        last_name: lastName,
        email,
        partner_code: role === "trainer_admin" || role === "trainer" ? `${firstName.toUpperCase()}${Math.floor(Math.random() * 9000) + 1000}` : null,
        parent_user_id: null,
        is_reset_password: 1,
        email_verified_at: new Date().toISOString(),
      },
    },
  };
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const role = searchParams.get("role") || "trainer";
  const heading = ROLE_HEADINGS[role] || "Welcome!";
  const blurb = ROLE_BLURBS[role] || "";

  const [firstName, setFirstName] = useState(searchParams.get("first_name") || "");
  const [lastName, setLastName] = useState(searchParams.get("last_name") || "");
  const [email] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (firstName.trim().length < 2) return toast.error("First name required.");
    if (lastName.trim().length < 1)  return toast.error("Last name required.");
    if (!/^\d{6}$/.test(code))       return toast.error("Verification code must be 6 digits.");
    if (password.length < 8)         return toast.error("Password must be at least 8 characters.");
    if (password !== confirm)        return toast.error("Passwords don't match.");

    setSubmitting(true);
    try {
      const result = await verifyAndSetPassword({
        token, code, password,
        email, role, firstName: firstName.trim(), lastName: lastName.trim(),
      });
      if (!result.ok) throw new Error("Failed");

      persistLoginResponse(result.response);
      toast.success(`Account created. Welcome, ${firstName}!`);
      const home = landingPathForUser(result.response.user);
      router.push(home);
    } catch {
      toast.error("Could not create your account. The verification code may be wrong or expired.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9]";
  const labelClass = "text-[#535359] text-[12px] font-semibold";

  if (!token) {
    return (
      <div className="bg-white shadow-lg rounded-[12px] p-8 max-w-md w-full">
        <h2 className="text-[24px] font-bold text-[#252525]">Invalid invite link</h2>
        <p className="text-[#535359] text-[13px] mt-2">
          This signup link is missing required information. Please use the original
          link in your email or ask the person who invited you to resend it.
        </p>
        <Link href="/" className="inline-block mt-6 rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-[12px] p-8 max-w-md w-full flex flex-col gap-5">
      <div>
        <h2 className="text-[28px] font-bold text-[#252525] tracking-[-0.5px]">{heading}</h2>
        {blurb && <p className="text-[#535359] text-[13px] mt-2">{blurb}</p>}
        <p className="text-[#A1A1A1] text-[11px] mt-3">
          Set a password to finish creating your account.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>First name</label>
          <input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Last name</label>
          <input className={fieldClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      {email && (
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Email</label>
          <input className={`${fieldClass} bg-[#F5F7FA]`} value={email} readOnly />
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Verification code</label>
        <input
          className={`${fieldClass} font-mono tracking-widest text-center`}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
        />
        <span className="text-[#A1A1A1] text-[11px]">6-digit code from your invitation email.</span>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Password</label>
        <input className={fieldClass} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Confirm password</label>
        <input className={fieldClass} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[10px] bg-[#308BF9] text-white text-[14px] font-semibold py-3 disabled:opacity-60"
      >
        {submitting ? "Creating account..." : "Create account"}
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
