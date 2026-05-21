"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cookieManager } from "@/lib/cookies";
import {
  inviteTrainerClientService,
  resendTrainerClientInviteService,
  revokeTrainerClientInviteService,
} from "@/services/authService";
import Cookies from "js-cookie";

function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64).split("").map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`).join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function getTrainerIdFromCookie() {
  const token = Cookies.get("access_token");
  if (!token) return null;
  const decoded = decodeJwt(token);
  return decoded?.dietician_id ?? decoded?.sub ?? null;
}

function resolvePartnerCode(dietician) {
  return dietician?.partner_code || dietician?.dietician_id || "";
}

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidMobile = (m) => /^\+?[0-9\s\-()]{7,}$/.test(m);

const PLANS = [
  { id: "free_trial", label: "Free Trial",        price: "$0",   badge: "Free",    badgeColor: "bg-[#E5F6EE] text-[#1F7A4A]" },
  { id: "monthly",    label: "Monthly Plan",       price: "$50",  badge: "$50/mo",  badgeColor: "bg-[#EEF4FE] text-[#308BF9]" },
  { id: "lease",      label: "Lease (Quarterly)",  price: "$150", badge: "$150",    badgeColor: "bg-[#FFF4E0] text-[#A66B00]" },
  { id: "yearly",     label: "Yearly Plan",        price: "$300", badge: "$300/yr", badgeColor: "bg-[#F3EEFE] text-[#6B45BC]" },
];

function PartnerCodeCard({ code, name }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Partner code copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Long-press to copy manually.");
    }
  };

  return (
    <div className="bg-[#F5F7FA] rounded-[10px] p-5 flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[#A1A1A1] text-[11px] uppercase tracking-wide font-semibold">
          Your partner code
        </span>
        <span className="text-[#535359] text-[12px]">
          {name ? `${name} · ` : ""}Share this code so clients can attribute
          their subscription to you.
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-white rounded-[10px] px-4 py-3 border border-[#E1E6ED]">
          <span className="text-[#252525] text-[20px] font-bold tracking-wide">
            {code || "\u2014"}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!code}
          className="rounded-[10px] bg-[#308BF9] text-white text-[12px] font-semibold px-4 py-3 disabled:opacity-50 cursor-pointer"
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>
    </div>
  );
}

function InviteForm({ partnerCode, onSent }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free_trial");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setMobile("");
    setEmail("");
    setSelectedPlan("free_trial");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!partnerCode) {
      toast.error("Partner code not loaded yet — try again in a moment.");
      return;
    }
    if (name.trim().length < 2) {
      toast.error("Please enter the client's name.");
      return;
    }
    if (!isValidMobile(mobile)) {
      toast.error("Please enter a valid mobile number.");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email.");
      return;
    }

    const trainerId = getTrainerIdFromCookie();
    if (!trainerId) {
      return toast.error("Session expired. Please log in again.");
    }

    setSubmitting(true);
    try {
      const res = await inviteTrainerClientService({
        trainerID: trainerId,
        clientName: name.trim(),
        clientMobile: mobile.trim(),
        clientEmail: email.trim(),
        plan: selectedPlan,
      });

      const planObj = PLANS.find((p) => p.id === selectedPlan);

      onSent({
        id: res?.data?.invite_id ?? `local-${Date.now()}`,
        name: res?.data?.client_name ?? name.trim(),
        mobile: res?.data?.client_mobile ?? mobile.trim(),
        email: res?.data?.client_email ?? email.trim(),
        plan: res?.data?.plan ?? selectedPlan,
        planLabel: planObj?.badge ?? selectedPlan,
        partnerCode,
        status: res?.data?.invite_status ?? res?.data?.status ?? "Sent",
        sentAt: res?.data?.created_at ?? new Date().toISOString(),
      });
      toast.success(`Invite sent to ${name.trim()} — ${planObj?.label}`);
      reset();
    } catch (err) {
      const msg = err?.data?.message || err?.message || "";
      if (msg.toLowerCase().includes("already has a pending invitation")) {
        toast.success(`Invite sent to ${name.trim()}`);
        reset();
      } else {
        toast.error(msg || "Could not send invite. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9] transition-colors";
  const labelClass = "text-[#535359] text-[12px] font-semibold";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-[#252525] text-[14px] font-bold">Invite a client</h3>
        <p className="text-[#535359] text-[12px]">
          Send an invite with a deep link. Your partner code is attached
          automatically. The client receives a code based on the plan you select.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Name <span className="text-red-500">*</span></label>
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Mobile <span className="text-red-500">*</span></label>
          <input
            className={fieldClass}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+1 555 123 4567"
            inputMode="tel"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            inputMode="email"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Select plan <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => setSelectedPlan(plan.id)}
              className={`rounded-[10px] border px-3 py-2.5 text-left transition-all cursor-pointer ${
                selectedPlan === plan.id
                  ? "border-[#308BF9] bg-[#EEF4FE] ring-1 ring-[#308BF9]"
                  : "border-[#E1E6ED] bg-white hover:border-[#C4C9D4]"
              }`}
            >
              <span className={`inline-flex rounded-full text-[10px] font-semibold px-2 py-0.5 mb-1.5 ${plan.badgeColor}`}>
                {plan.badge}
              </span>
              <p className="text-[12px] font-semibold text-[#252525]">{plan.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60 hover:bg-[#1a76e8] transition-colors cursor-pointer"
        >
          {submitting ? "Sending..." : "Send invite"}
        </button>
        <span className="text-[#A1A1A1] text-[11px]">
          Client will receive a code for the {PLANS.find((p) => p.id === selectedPlan)?.label}.
        </span>
      </div>
    </form>
  );
}

function PendingInvites({ invites, onResend, onRevoke }) {
  const [actionInProgress, setActionInProgress] = useState({});

  const handleResend = async (inv) => {
    setActionInProgress((prev) => ({ ...prev, [`resend-${inv.id}`]: true }));
    try { await onResend(inv); } finally {
      setActionInProgress((prev) => ({ ...prev, [`resend-${inv.id}`]: false }));
    }
  };

  const handleRevoke = async (inv) => {
    setActionInProgress((prev) => ({ ...prev, [`revoke-${inv.id}`]: true }));
    try { await onRevoke(inv); } finally {
      setActionInProgress((prev) => ({ ...prev, [`revoke-${inv.id}`]: false }));
    }
  };

  if (invites.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        No invites sent yet. Use the form above to invite your first client.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[#F5F7FA] text-[#535359] text-left">
            <th className="py-2.5 px-4 font-semibold">Name</th>
            <th className="py-2.5 px-4 font-semibold">Mobile</th>
            <th className="py-2.5 px-4 font-semibold">Email</th>
            <th className="py-2.5 px-4 font-semibold">Plan</th>
            <th className="py-2.5 px-4 font-semibold">Status</th>
            <th className="py-2.5 px-4 font-semibold">Sent</th>
            <th className="py-2.5 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((inv) => {
            const planObj = PLANS.find((p) => p.id === inv.plan);
            return (
              <tr key={inv.id} className="border-t border-[#F5F7FA]">
                <td className="py-2.5 px-4 text-[#252525] font-semibold">{inv.name}</td>
                <td className="py-2.5 px-4 text-[#535359]">{inv.mobile}</td>
                <td className="py-2.5 px-4 text-[#535359]">{inv.email}</td>
                <td className="py-2.5 px-4">
                  {planObj ? (
                    <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${planObj.badgeColor}`}>
                      {planObj.badge}
                    </span>
                  ) : (
                    <span className="text-[#A1A1A1]">{inv.plan || "-"}</span>
                  )}
                </td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5">
                    {inv.status}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-[#A1A1A1]">
                  {new Date(inv.sentAt).toLocaleString("en-US", {
                    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                  })}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleResend(inv)}
                      disabled={actionInProgress[`resend-${inv.id}`]}
                      className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5 hover:bg-[#d9e8fd] disabled:opacity-60 cursor-pointer"
                    >
                      {actionInProgress[`resend-${inv.id}`] ? "Sending..." : "Resend"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRevoke(inv)}
                      disabled={actionInProgress[`revoke-${inv.id}`]}
                      className="rounded-full bg-[#FCEAEB] text-[#B5363A] text-[11px] font-semibold px-2.5 py-0.5 hover:bg-[#f8d4d5] disabled:opacity-60 cursor-pointer"
                    >
                      {actionInProgress[`revoke-${inv.id}`] ? "Revoking..." : "Revoke"}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ReferralsPage() {
  const [dietician, setDietician] = useState(null);
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    setDietician(cookieManager.getJSON("dietician"));
  }, []);

  const partnerCode = resolvePartnerCode(dietician);
  const name = dietician?.name || "";

  const onSent = (invite) => setInvites((list) => [invite, ...list]);

  const handleResend = async (inv) => {
    const trainerId = getTrainerIdFromCookie();
    if (!trainerId) return toast.error("Session expired. Please log in again.");

    try {
      await resendTrainerClientInviteService({
        inviteId: inv.id,
        trainerID: trainerId,
        clientName: inv.name,
        clientMobile: inv.mobile,
        clientEmail: inv.email,
        plan: inv.plan,
      });
      toast.success(`Invite resent to ${inv.name}`);
    } catch (err) {
      const msg = err?.data?.message || err?.message || "";
      if (msg.toLowerCase().includes("already has a pending invitation")) {
        toast.success(`Invite resent to ${inv.name}`);
      } else {
        toast.error(msg || "Could not resend invite.");
      }
    }
  };

  const handleRevoke = async (inv) => {
    try {
      await revokeTrainerClientInviteService({ inviteId: inv.id });
      setInvites((list) => list.filter((i) => i.id !== inv.id));
      toast.success(`Invite to ${inv.name} revoked.`);
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Could not revoke invite.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-[#252525] text-[16px] font-bold">Referrals</h2>
        <p className="text-[#535359] text-[13px] mt-1">
          Share your partner code, send invites, and track which clients have
          been invited. Select a plan and the client receives a code for that plan.
        </p>
      </div>

      <PartnerCodeCard code={partnerCode} name={name} />

      <InviteForm partnerCode={partnerCode} onSent={onSent} />

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Pending invites
        </h3>
        <PendingInvites
          invites={invites}
          onResend={handleResend}
          onRevoke={handleRevoke}
        />
      </div>
    </div>
  );
}
