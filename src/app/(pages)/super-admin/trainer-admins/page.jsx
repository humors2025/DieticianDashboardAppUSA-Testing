"use client";

import { useState } from "react";
import { toast } from "sonner";

// Stub for the future backend call. When backend ships:
//   POST /api/invites with { role: 'trainer_admin', first_name, last_name, email, phone }
//   → backend creates pending_invites row, sends Resend email with verification link.
async function inviteTrainerAdmin({ firstName, lastName, email, phone }) {
  await new Promise((r) => setTimeout(r, 400));
  return {
    ok: true,
    invite: {
      id: `local-${Date.now()}`,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      status: "Sent",
      sentAt: new Date().toISOString(),
    },
  };
}

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p) => /^\+?[0-9\s\-()]{7,}$/.test(p);

function InviteForm({ onSent }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFirstName(""); setLastName(""); setEmail(""); setPhone("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (firstName.trim().length < 2) return toast.error("First name required.");
    if (lastName.trim().length < 1)  return toast.error("Last name required.");
    if (!isValidEmail(email))         return toast.error("Valid email required.");
    if (!isValidPhone(phone))         return toast.error("Valid phone required.");

    setSubmitting(true);
    try {
      const res = await inviteTrainerAdmin({
        firstName: firstName.trim(), lastName: lastName.trim(),
        email: email.trim(), phone: phone.trim(),
      });
      if (!res.ok) throw new Error("Failed");
      onSent(res.invite);
      toast.success(`Invite sent to ${res.invite.first_name} ${res.invite.last_name}`);
      reset();
    } catch {
      toast.error("Could not send invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9]";
  const labelClass = "text-[#535359] text-[12px] font-semibold";

  return (
    <form onSubmit={onSubmit} className="bg-[#F5F7FA] rounded-[10px] p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold">Invite a Trainer Admin</h3>
        <p className="text-[#535359] text-[12px] mt-1">
          They'll receive an email with a verification link to complete signup. Their role is locked at <span className="font-semibold">Trainer Admin</span>.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1"><label className={labelClass}>First name</label><input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Evan" /></div>
        <div className="flex flex-col gap-1"><label className={labelClass}>Last name</label><input className={fieldClass} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Gaudet" /></div>
        <div className="flex flex-col gap-1"><label className={labelClass}>Email</label><input className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="evan@example.com" inputMode="email" /></div>
        <div className="flex flex-col gap-1"><label className={labelClass}>Phone</label><input className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" inputMode="tel" /></div>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60">
          {submitting ? "Sending..." : "Send invite"}
        </button>
        <span className="text-[#A1A1A1] text-[11px]">Backend wiring (Resend email + verification flow) is pending.</span>
      </div>
    </form>
  );
}

function PendingInvitesTable({ rows }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        No invites pending. Use the form above to invite a new Trainer Admin.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[#F5F7FA] text-[#535359] text-left">
            <th className="py-2.5 px-4 font-semibold">Name</th>
            <th className="py-2.5 px-4 font-semibold">Email</th>
            <th className="py-2.5 px-4 font-semibold">Phone</th>
            <th className="py-2.5 px-4 font-semibold">Status</th>
            <th className="py-2.5 px-4 font-semibold">Sent</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-[#F5F7FA]">
              <td className="py-2.5 px-4 text-[#252525] font-semibold">{r.first_name} {r.last_name}</td>
              <td className="py-2.5 px-4 text-[#535359]">{r.email}</td>
              <td className="py-2.5 px-4 text-[#535359]">{r.phone}</td>
              <td className="py-2.5 px-4"><span className="inline-flex rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5">{r.status}</span></td>
              <td className="py-2.5 px-4 text-[#A1A1A1]">{new Date(r.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TrainerAdminsPage() {
  const [invites, setInvites] = useState([]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
          Trainer Admins
        </h1>
        <p className="text-[#535359] text-[13px] mt-1">
          Invite and manage Trainer Admins. They onboard their own trainers and earn 20% override commission on their network's subscriptions.
        </p>
      </div>

      <InviteForm onSent={(inv) => setInvites((list) => [inv, ...list])} />

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Pending invites</h3>
        <PendingInvitesTable rows={invites} />
      </div>
    </div>
  );
}
