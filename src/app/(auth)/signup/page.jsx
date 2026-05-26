"use client";

// Signup / accept-invite page.
//
// Entry: /signup?token=...
// Invite details (name, email, role) are fetched from invite-preview API.

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { cookieManager } from "@/lib/cookies";
import { previewInviteService, acceptInviteService } from "@/services/authService";

const ROLE_HEADINGS = {
  super_admin:   "Super-Admin",
  trainer_admin: "Trainer-Admin",
  trainer:       "Trainer",
  client:        "Client",
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const hasToken = Boolean(token);

  const [previewLoading, setPreviewLoading] = useState(hasToken);
  const [previewError, setPreviewError] = useState("");
  const [invite, setInvite] = useState(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hasToken) {
      setPreviewLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await previewInviteService(token);
        if (cancelled) return;
        const data = res?.data || res;
        setInvite(data);
      } catch (err) {
        if (cancelled) return;
        const msg = err?.data?.message || err?.message || "Could not load invitation details.";
        setPreviewError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [token, hasToken]);

  const role = invite?.role || "";
  const roleLabel = ROLE_HEADINGS[role] || "";
  const firstName = invite?.first_name || "";
  const lastName = invite?.last_name || "";
  const fullName = invite?.name || [firstName, lastName].filter(Boolean).join(" ");
  const email = invite?.email || "";

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!token) return toast.error("Missing invitation token.");
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    if (password !== confirm) return toast.error("Passwords don't match.");

    setSubmitting(true);
    try {
      await acceptInviteService({
        token,
        password,
        confirm_password: confirm,
      });

      cookieManager.clearAuth();
      toast.success(`Welcome aboard, ${firstName || ""}! You're all set.`);
      router.push("/");
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

  if (!hasToken) {
    return (
      <div className="bg-white shadow-lg rounded-[12px] p-8 max-w-md w-full text-center">
        <h2 className="text-[20px] font-bold text-[#252525]">Invitation token missing</h2>
        <p className="text-[#535359] text-[13px] mt-2">
          Please use the signup link from your invitation email.
        </p>
      </div>
    );
  }

  if (previewLoading) {
    return (
      <div className="bg-white shadow-lg rounded-[12px] p-8 max-w-md w-full flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#308BF9] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#535359] text-[13px]">Loading invitation details…</p>
      </div>
    );
  }

  if (previewError) {
    return (
      <div className="bg-white shadow-lg rounded-[12px] p-8 max-w-md w-full text-center">
        <h2 className="text-[20px] font-bold text-[#252525]">Invitation unavailable</h2>
        <p className="text-[#535359] text-[13px] mt-2">{previewError}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white shadow-lg rounded-[12px] p-8 max-w-md w-full flex flex-col gap-5">
      <div>
        <h2 className="text-[28px] font-bold text-[#252525] tracking-[-0.5px]">
          Welcome to Respyr!
        </h2>
        {roleLabel && (
          <p className="text-[#535359] text-[13px] mt-1">
            You've been invited as a <span className="font-semibold text-[#308BF9]">{roleLabel}</span> on Respyr.
          </p>
        )}
        <p className="text-[#A1A1A1] text-[11px] mt-3">
          Confirm your details and set a password to complete your account.
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Name</label>
        <input className={`${fieldClass} bg-[#F5F7FA]`} value={fullName} readOnly />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Email</label>
        <input className={`${fieldClass} bg-[#F5F7FA]`} value={email} readOnly />
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            className={`${fieldClass} pr-10`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowPassword((v) => !v)}
          >
            <Image
              src="/icons/hugeicons_view.svg"
              alt={showPassword ? "Hide password" : "Show password"}
              width={15}
              height={15}
              className={showPassword ? "opacity-50" : "opacity-100"}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className={labelClass}>Confirm password <span className="text-red-500">*</span></label>
        <div className="relative">
          <input
            className={`${fieldClass} pr-10`}
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter password"
          />
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowConfirm((v) => !v)}
          >
            <Image
              src="/icons/hugeicons_view.svg"
              alt={showConfirm ? "Hide password" : "Show password"}
              width={15}
              height={15}
              className={showConfirm ? "opacity-50" : "opacity-100"}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-[10px] bg-[#308BF9] text-white text-[14px] font-semibold py-3 disabled:opacity-60 hover:bg-[#1a76e8] transition-colors cursor-pointer"
      >
        {submitting ? "Setting up your account..." : "Create account"}
      </button>
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
