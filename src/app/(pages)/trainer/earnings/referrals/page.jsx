"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cookieManager } from "@/lib/cookies";

// Until backend adds a dedicated `partner_code` column, we use the
// existing `dietician_id` as the partner code. When backend ships a
// vanity code, swap this resolver and the rest of the page works as-is.
function resolvePartnerCode(dietician) {
  return dietician?.partner_code || dietician?.dietician_id || "";
}

// Stub for the future backend call. Today: returns a fake invite record so
// we can exercise the form + pending-list UI. When backend lands, replace
// the body with a POST to the invite endpoint.
async function sendInvite({ name, mobile, email, partnerCode }) {
  await new Promise((r) => setTimeout(r, 400));
  return {
    ok: true,
    invite: {
      id: `local-${Date.now()}`,
      name,
      mobile,
      email,
      partnerCode,
      status: "Sent",
      sentAt: new Date().toISOString(),
    },
  };
}

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidMobile = (m) => /^\+?[0-9\s\-()]{7,}$/.test(m);

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
            {code || "—"}
          </span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!code}
          className="rounded-[10px] bg-[#308BF9] text-white text-[12px] font-semibold px-4 py-3 disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy code"}
        </button>
      </div>

      <p className="text-[#A1A1A1] text-[11px]">
        Branded vanity codes (e.g. <span className="font-semibold">EVAN2026</span>)
        are coming. For now this is your trainer ID.
      </p>
    </div>
  );
}

function InviteForm({ partnerCode, onSent }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName("");
    setMobile("");
    setEmail("");
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

    setSubmitting(true);
    try {
      const res = await sendInvite({
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        partnerCode,
      });
      if (!res.ok) throw new Error("Failed to send");
      onSent(res.invite);
      toast.success(`Invite sent to ${res.invite.name}`);
      reset();
    } catch {
      toast.error("Could not send invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9]";
  const labelClass = "text-[#535359] text-[12px] font-semibold";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="text-[#252525] text-[14px] font-bold">Invite a client</h3>
        <p className="text-[#535359] text-[12px]">
          We'll send an automated WhatsApp + Email with a deep link. Your
          partner code is attached automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Name</label>
          <input
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Mobile</label>
          <input
            className={fieldClass}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="+1 555 123 4567"
            inputMode="tel"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Email</label>
          <input
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@example.com"
            inputMode="email"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send invite"}
        </button>
        <span className="text-[#A1A1A1] text-[11px]">
          Backend wiring (WhatsApp + Email + deep link) is pending — invites
          appear in the list below for now.
        </span>
      </div>
    </form>
  );
}

function PendingInvites({ invites }) {
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
            <th className="py-2.5 px-4 font-semibold">Status</th>
            <th className="py-2.5 px-4 font-semibold">Sent</th>
          </tr>
        </thead>
        <tbody>
          {invites.map((inv) => (
            <tr key={inv.id} className="border-t border-[#F5F7FA]">
              <td className="py-2.5 px-4 text-[#252525] font-semibold">{inv.name}</td>
              <td className="py-2.5 px-4 text-[#535359]">{inv.mobile}</td>
              <td className="py-2.5 px-4 text-[#535359]">{inv.email}</td>
              <td className="py-2.5 px-4">
                <span className="inline-flex rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5">
                  {inv.status}
                </span>
              </td>
              <td className="py-2.5 px-4 text-[#A1A1A1]">
                {new Date(inv.sentAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </td>
            </tr>
          ))}
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-[#252525] text-[16px] font-bold">Referrals</h2>
        <p className="text-[#535359] text-[13px] mt-1">
          Share your partner code, send invites, and track which clients have
          been invited.
        </p>
      </div>

      <PartnerCodeCard code={partnerCode} name={name} />

      <InviteForm partnerCode={partnerCode} onSent={onSent} />

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Pending invites
        </h3>
        <PendingInvites invites={invites} />
      </div>
    </div>
  );
}
