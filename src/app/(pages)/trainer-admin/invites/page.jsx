"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  inviteTrainerClientService,
  fetchTrainerClientInvitesService,
  resendUserInviteService,
  revokeTrainerClientInviteService,
} from "@/services/authService";

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getLoggedInUserFromCookie() {
  const token = Cookies.get("access_token");
  if (token) {
    const decoded = decodeJwt(token);
    if (decoded) return decoded;
  }
  const userCookie = Cookies.get("user");
  if (userCookie) {
    try { return JSON.parse(userCookie); } catch { return null; }
  }
  return null;
}

function getActorUserIdFromCookie() {
  const decoded = getLoggedInUserFromCookie();
  return decoded?.user_id ?? decoded?.email ?? null;
}

// ---------------------------------------------------------------------------
// Data normalizers
// ---------------------------------------------------------------------------
function splitClientName(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  return { first_name: parts[0] ?? "", last_name: parts.slice(1).join(" ") };
}

function normalizeInvite(invite = {}) {
  const hasExplicitNames = invite.first_name || invite.last_name;
  const { first_name: derivedFirst, last_name: derivedLast } = hasExplicitNames
    ? { first_name: invite.first_name ?? "", last_name: invite.last_name ?? "" }
    : splitClientName(invite.name ?? invite.client_name);

  return {
    id: invite.invitation_id ?? invite.invite_id ?? `${invite.email ?? invite.client_email}-${invite.created_at}`,
    first_name: derivedFirst,
    last_name: derivedLast,
    email: invite.email ?? invite.client_email ?? "",
    phone: invite.phone_no ?? invite.client_mobile ?? "",
    role: invite.role ?? "trainer",
    plan: invite.plan ?? null,
    status: invite.status ?? "pending",
    sentAt: invite.sent_at ?? invite.created_at ?? invite.updated_at ?? new Date().toISOString(),
    expires_at: invite.expires_at ?? null,
    acceptedAt: invite.accepted_at ?? null,
    acceptedProfileId: invite.accepted_profile_id ?? invite.partner_code ?? null,
    trainer_name: invite.trainer_name ?? [invite.first_name, invite.last_name].filter(Boolean).join(" ") ?? "",
    trainer_code: invite.partner_code ?? invite.trainer_code ?? "",
    invited_by_user_id: invite.invited_by_user_id ?? null,
    parent_user_id: invite.parent_user_id ?? null,
    can_resend: invite.can_resend ?? true,
    can_revoke: invite.can_revoke ?? true,
  };
}

function isInvitationExpired(invitation) {
  if (String(invitation?.status || "").toLowerCase() === "expired") return true;
  if (!invitation?.expires_at) return false;
  const expiresAt = new Date(String(invitation.expires_at).replace(" ", "T"));
  if (Number.isNaN(expiresAt.getTime())) return false;
  return expiresAt.getTime() < Date.now();
}

function formatInviteDate(dateValue) {
  if (!dateValue) return "-";
  const normalized = typeof dateValue === "string" ? dateValue.replace(" ", "T") : dateValue;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p) => /^\+?[0-9\s\-()]{7,}$/.test(p);

const AUDIT_ACTION_STYLES = {
  invited: "bg-[#E5F6EE] text-[#1F7A4A]",
  resent: "bg-[#EEF4FE] text-[#308BF9]",
  revoked: "bg-[#FCEAEB] text-[#B5363A]",
  rejected: "bg-[#FFF4E0] text-[#A66B00]",
  "accepted (email)": "bg-[#E5F6EE] text-[#1F7A4A]",
  "accepted (phone)": "bg-[#E5F6EE] text-[#1F7A4A]",
};

function formatAuditTimestamp(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return String(dateValue);
  return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// InviteForm
// ---------------------------------------------------------------------------
const PLANS = [
  { id: "free_trial", label: "Free Trial", price: "$0", badge: "Free", badgeColor: "bg-[#E5F6EE] text-[#1F7A4A]" },
  { id: "monthly", label: "Monthly Plan", price: "$50", badge: "$50/mo", badgeColor: "bg-[#EEF4FE] text-[#308BF9]" },
  { id: "lease", label: "Lease (Quarterly)", price: "$150", badge: "$150", badgeColor: "bg-[#FFF4E0] text-[#A66B00]" },
  { id: "yearly", label: "Yearly Plan", price: "$300", badge: "$300/yr", badgeColor: "bg-[#F3EEFE] text-[#6B45BC]" },
];

function InviteForm({ onSent }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("free_trial");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => { setFirstName(""); setLastName(""); setEmail(""); setPhone(""); setSelectedPlan("free_trial"); };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (firstName.trim().length < 2) return toast.error("First name required.");
    if (lastName.trim().length < 1) return toast.error("Last name required.");
    if (!isValidEmail(email)) return toast.error("Valid email required.");
    if (!isValidPhone(phone)) return toast.error("Valid phone required.");

    setSubmitting(true);
    try {
      const res = await inviteTrainerClientService({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      await onSent({
        invite_id: res?.data?.invite_id ?? res?.data?.invitation_id ?? `invite-${Date.now()}`,
        client_name: res?.data?.client_name ?? res?.data?.invited_name ?? `${firstName.trim()} ${lastName.trim()}`,
        client_mobile: res?.data?.client_mobile ?? res?.data?.invited_phone ?? phone.trim(),
        client_email: res?.data?.client_email ?? res?.data?.invited_email ?? email.trim(),
        plan: res?.data?.plan ?? selectedPlan,
        status: res?.data?.invite_status ?? res?.data?.status ?? "pending",
        created_at: res?.data?.created_at ?? new Date().toISOString(),
        trainer_name: res?.data?.trainer_name ?? "",
        trainer_code: res?.data?.trainer_code ?? res?.data?.partner_code ?? "",
      });

      toast.success(`Invite sent to ${firstName.trim()} ${lastName.trim()}`);
      reset();
    } catch (err) {
      toast.error(err?.message || "Could not send invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] placeholder-[#C4C9D4] focus:outline-none focus:border-[#308BF9] transition-colors";
  const labelClass = "text-[#535359] text-[12px] font-semibold";

  return (
    <form onSubmit={onSubmit} className="bg-[#F5F7FA] rounded-[10px] p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold">Invite a Client</h3>
        <p className="text-[#535359] text-[12px] mt-1">
          They&apos;ll receive an email invite. Once they sign up, they&apos;ll be linked to your trainer account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>First name <span className="text-red-500">*</span></label>
          <input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marcus" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Last name <span className="text-red-500">*</span></label>
          <input className={fieldClass} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Hill" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Email <span className="text-red-500">*</span></label>
          <input className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marcus@example.com" inputMode="email" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
          <input className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" inputMode="tel" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClass}>Plan <span className="text-red-500">*</span></label>
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
              <span className={`inline-flex rounded-full text-[10px] font-semibold px-2 py-0.5 mb-1.5 ${plan.badgeColor}`}>{plan.badge}</span>
              <p className="text-[12px] font-semibold text-[#252525]">{plan.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={submitting} className="rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60 hover:bg-[#1a76e8] transition-colors cursor-pointer">
          {submitting ? "Sending\u2026" : "Send invite"}
        </button>
        <span className="text-[#A1A1A1] text-[11px]">
          {PLANS.find((p) => p.id === selectedPlan)?.label} — client will receive a code for this plan.
        </span>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// AcceptedClientsTable
// ---------------------------------------------------------------------------
function AcceptedClientsTable({ clients }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return clients;
    return clients.filter((client) =>
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(needle) ||
      client.email.toLowerCase().includes(needle) ||
      client.phone.toLowerCase().includes(needle) ||
      String(client.acceptedProfileId || "").toLowerCase().includes(needle)
    );
  }, [clients, q]);

  if (clients.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        No accepted clients yet.
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, or profile" className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px] flex-1 min-w-[200px] focus:outline-none focus:border-[#308BF9] transition-colors" />
      </div>
      <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F5F7FA] text-[#535359] text-left">
              <th className="py-2.5 px-4 font-semibold">Name</th>
              <th className="py-2.5 px-4 font-semibold">Email</th>
              <th className="py-2.5 px-4 font-semibold">Phone</th>
              <th className="py-2.5 px-4 font-semibold">Profile ID</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold">Accepted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr key={client.id} className="border-t border-[#F5F7FA]">
                <td className="py-2.5 px-4 text-[#252525] font-semibold">{client.first_name} {client.last_name}</td>
                <td className="py-2.5 px-4 text-[#535359]">{client.email}</td>
                <td className="py-2.5 px-4 text-[#535359]">{client.phone}</td>
                <td className="py-2.5 px-4 text-[#535359] font-mono">{client.acceptedProfileId || "-"}</td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex rounded-full bg-[#E5F6EE] text-[#1F7A4A] text-[11px] font-semibold px-2.5 py-0.5">{client.status}</span>
                </td>
                <td className="py-2.5 px-4 text-[#A1A1A1]">{formatInviteDate(client.acceptedAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]">No clients match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PendingInvitesTable
// ---------------------------------------------------------------------------
function PendingInvitesTable({ invites, onResend, onRevoke, auditLogs }) {
  const [actionInProgress, setActionInProgress] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [revokeModalInvitation, setRevokeModalInvitation] = useState(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isSubmittingRevokeReason, setIsSubmittingRevokeReason] = useState(false);

  const toggleRow = (id) => setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleResend = async (inv) => {
    const key = `resend-${inv.id}`;
    setActionInProgress((prev) => ({ ...prev, [key]: true }));
    try { await onResend(inv); } finally { setActionInProgress((prev) => ({ ...prev, [key]: false })); }
  };

  const handleRevoke = async (inv) => {
    if (isInvitationExpired(inv)) {
      const key = `revoke-${inv.id}`;
      setActionInProgress((prev) => ({ ...prev, [key]: true }));
      try { await onRevoke(inv, ""); } finally { setActionInProgress((prev) => ({ ...prev, [key]: false })); }
      return;
    }
    setRevokeReason("");
    setRevokeModalInvitation(inv);
  };

  const closeRevokeModal = () => { if (isSubmittingRevokeReason) return; setRevokeModalInvitation(null); setRevokeReason(""); };

  const submitRevokeReason = async () => {
    const trimmedReason = revokeReason.trim();
    if (trimmedReason.length === 0) return toast.error("Please provide a reason for revoking.");
    const inv = revokeModalInvitation;
    const key = `revoke-${inv.id}`;
    setIsSubmittingRevokeReason(true);
    setActionInProgress((prev) => ({ ...prev, [key]: true }));
    try {
      await onRevoke(inv, trimmedReason);
      setRevokeModalInvitation(null);
      setRevokeReason("");
    } finally {
      setIsSubmittingRevokeReason(false);
      setActionInProgress((prev) => ({ ...prev, [key]: false }));
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F5F7FA] text-[#535359] text-left">
              <th className="py-2.5 px-4 font-semibold">Name</th>
              <th className="py-2.5 px-4 font-semibold">Email</th>
              <th className="py-2.5 px-4 font-semibold">Phone</th>
              <th className="py-2.5 px-4 font-semibold">Plan</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold">Sent</th>
              <th className="py-2.5 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invites.map((inv) => {
              const resendKey = `resend-${inv.id}`;
              const revokeKey = `revoke-${inv.id}`;
              const isExpanded = expandedRows[inv.id];
              const logs = auditLogs[inv.id] || [];
              return (
                <Fragment key={inv.id}>
                  <tr className="border-t border-[#F5F7FA]">
                    <td className="py-2.5 px-4">
                      <button type="button" onClick={() => toggleRow(inv.id)} className="flex items-center gap-1.5 text-[#252525] font-semibold hover:text-[#308BF9] cursor-pointer text-left">
                        <span className={`text-[10px] transition-transform ${isExpanded ? "rotate-90" : ""}`}>&#9654;</span>
                        {inv.first_name} {inv.last_name}
                        {logs.length > 0 && <span className="text-[10px] text-[#A1A1A1] font-normal">({logs.length})</span>}
                      </button>
                    </td>
                    <td className="py-2.5 px-4 text-[#535359]">{inv.email}</td>
                    <td className="py-2.5 px-4 text-[#535359]">{inv.phone}</td>
                    <td className="py-2.5 px-4">
                      {inv.plan ? (
                        <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${PLANS.find((p) => p.id === inv.plan)?.badgeColor || "bg-[#F5F7FA] text-[#535359]"}`}>
                          {PLANS.find((p) => p.id === inv.plan)?.badge || inv.plan}
                        </span>
                      ) : <span className="text-[#A1A1A1]">-</span>}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                        String(inv.status).toLowerCase() === "expired" ? "bg-[#FFF4E0] text-[#A66B00]"
                        : String(inv.status).toLowerCase() === "revoked" ? "bg-[#FCEAEB] text-[#B5363A]"
                        : String(inv.status).toLowerCase() === "accepted" ? "bg-[#E5F6EE] text-[#1F7A4A]"
                        : "bg-[#EEF4FE] text-[#308BF9]"
                      }`}>{inv.status}</span>
                    </td>
                    <td className="py-2.5 px-4 text-[#A1A1A1]">{formatInviteDate(inv.sentAt)}</td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {inv.can_resend && (
                          <button type="button" onClick={() => handleResend(inv)} disabled={actionInProgress[resendKey]} className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5 hover:bg-[#d9e8fd] disabled:opacity-60 cursor-pointer">
                            {actionInProgress[resendKey] ? "Sending..." : "Resend"}
                          </button>
                        )}
                        {inv.can_revoke && (
                          <button type="button" onClick={() => handleRevoke(inv)} disabled={actionInProgress[revokeKey]} className="rounded-full bg-[#FCEAEB] text-[#B5363A] text-[11px] font-semibold px-2.5 py-0.5 hover:bg-[#f8d4d5] disabled:opacity-60 cursor-pointer">
                            {actionInProgress[revokeKey] ? "Revoking..." : "Revoke"}
                          </button>
                        )}
                        {!inv.can_resend && !inv.can_revoke && <span className="text-[#A1A1A1] text-[11px]">&mdash;</span>}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#FAFBFC]">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="ml-4 border-l-2 border-[#E1E6ED] pl-4">
                          <p className="text-[11px] font-semibold text-[#535359] mb-2">Audit log</p>
                          {logs.length === 0 ? (
                            <p className="text-[11px] text-[#A1A1A1]">No activity recorded yet.</p>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {logs.map((log, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-[11px]">
                                  <span className={`inline-flex rounded-full font-semibold px-2 py-0.5 ${AUDIT_ACTION_STYLES[log.action] || "bg-[#F5F7FA] text-[#535359]"}`}>{log.action}</span>
                                  <span className="text-[#535359]">by <span className="font-semibold">{log.actor}</span></span>
                                  {log.detail && <span className="text-[#535359] italic">{log.detail}</span>}
                                  <span className="text-[#A1A1A1]">{formatAuditTimestamp(log.timestamp)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {invites.length === 0 && (
              <tr><td colSpan={7} className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]">No pending invites found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {revokeModalInvitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={closeRevokeModal}>
          <div className="w-full max-w-[420px] rounded-[12px] bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[#252525] text-[15px] font-bold">Revoke invite</h3>
            <p className="text-[#535359] text-[12px] mt-1">
              Tell {revokeModalInvitation.first_name || revokeModalInvitation.email || "this user"} why their invite is being revoked.
            </p>
            <label className="block mt-4 text-[#535359] text-[12px] font-semibold">Reason <span className="text-red-500">*</span></label>
            <textarea value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} placeholder="e.g. Wrong email" rows={3} disabled={isSubmittingRevokeReason} className="mt-1 w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9] resize-none" />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button type="button" onClick={closeRevokeModal} disabled={isSubmittingRevokeReason} className="rounded-[10px] bg-[#F5F7FA] text-[#535359] text-[12px] font-semibold px-4 py-2 disabled:opacity-60 cursor-pointer">Cancel</button>
              <button type="button" onClick={submitRevokeReason} disabled={isSubmittingRevokeReason} className="rounded-[10px] bg-[#B5363A] text-white text-[12px] font-semibold px-4 py-2 disabled:opacity-60 cursor-pointer">
                {isSubmittingRevokeReason ? "Revoking..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TrainerAdminInvitesPage() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [acceptedClients, setAcceptedClients] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [expiredInvites, setExpiredInvites] = useState([]);
  const [revokedInvites, setRevokedInvites] = useState([]);
  const [totals, setTotals] = useState({ accepted_count: 0, pending_count: 0, expired_count: 0, revoked_count: 0 });

  const [auditLogs, setAuditLogs] = useState({});
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [inviteListError, setInviteListError] = useState("");

  const addAuditEntry = (inviteId, action, detail = null) => {
    const actor = user?.email || user?.user_id || "Unknown";
    setAuditLogs((prev) => ({
      ...prev,
      [inviteId]: [...(prev[inviteId] || []), { action, actor, timestamp: new Date().toISOString(), detail }],
    }));
  };

  const loadInvites = useCallback(async () => {
    const actorUserId = getActorUserIdFromCookie();
    if (!actorUserId) { setInviteListError("Session expired. Please log in again."); return; }

    setLoadingInvites(true);
    setInviteListError("");

    try {
      const res = await fetchTrainerClientInvitesService({ actorUserId });

      const acceptedClientList = Array.isArray(res?.existing) ? res.existing : Array.isArray(res?.accepted_clients) ? res.accepted_clients : [];
      const pendingInviteList = Array.isArray(res?.pending_invites) ? res.pending_invites : [];
      const expiredInviteList = Array.isArray(res?.expired_invites) ? res.expired_invites : [];
      const revokedInviteList = Array.isArray(res?.revoked_invites) ? res.revoked_invites : [];

      setAcceptedClients(acceptedClientList.map(normalizeInvite));
      setPendingInvites(pendingInviteList.map(normalizeInvite));
      setExpiredInvites(expiredInviteList.map(normalizeInvite));
      setRevokedInvites(revokedInviteList.map(normalizeInvite));

      if (res?.totals && typeof res.totals === "object") {
        setTotals((prev) => ({ ...prev, ...res.totals }));
      }
    } catch (err) {
      const message = err?.message || "Could not fetch invites. Please try again.";
      setInviteListError(message);
      toast.error(message);
    } finally {
      setLoadingInvites(false);
    }
  }, []);

  useEffect(() => {
    const loggedInUser = getLoggedInUserFromCookie();
    setUser(loggedInUser);
    setCheckingSession(false);
    loadInvites();
  }, [loadInvites]);

  if (checkingSession) return <div className="text-[#A1A1A1] text-[13px]">Loading&hellip;</div>;
  if (!user) return <div className="text-[#A1A1A1] text-[13px]">Session expired. Please log in again.</div>;

  const handleInviteSent = async (invite) => {
    const normalizedInvite = normalizeInvite(invite);
    setPendingInvites((prev) => [normalizedInvite, ...prev.filter((item) => item.id !== normalizedInvite.id)]);
    const planLabel = PLANS.find((p) => p.id === normalizedInvite.plan)?.label || normalizedInvite.plan;
    addAuditEntry(normalizedInvite.id, "invited", `to ${normalizedInvite.email} — ${planLabel}`);
    await loadInvites();
  };

  const handleResendInvite = async (inv) => {
    try {
      await resendUserInviteService({ inviteId: inv.id });
      addAuditEntry(inv.id, "resent", `to ${inv.email}`);
      toast.success(`Invite resent to ${inv.first_name} ${inv.last_name}`);
      await loadInvites();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || "Could not resend invite.");
    }
  };

  const handleRevokeInvite = async (inv, reason = "") => {
    try {
      await revokeTrainerClientInviteService({ inviteId: inv.id, reason });
      addAuditEntry(inv.id, "revoked", reason ? `reason: ${reason}` : null);
      setPendingInvites((prev) => prev.filter((item) => item.id !== inv.id));
      toast.success(`Invite to ${inv.first_name} ${inv.last_name} revoked.`);
    } catch (error) {
      toast.error(error?.message || "Could not revoke invite.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
          Invites & Referrals
        </h1>
        <p className="text-[#535359] text-[13px] mt-1">
          Send client invites and track their status.
        </p>
      </div>

      <InviteForm onSent={handleInviteSent} />

      {inviteListError && (
        <div className="rounded-[10px] border border-[#FCEAEB] bg-[#FFF7F7] text-[#B5363A] text-[12px] p-3">{inviteListError}</div>
      )}

      {/* Totals strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { label: "Accepted", value: totals.accepted_count, color: "text-[#1F7A4A]" },
          { label: "Pending", value: totals.pending_count, color: "text-[#308BF9]" },
          { label: "Expired", value: totals.expired_count, color: "text-[#A66B00]" },
          { label: "Revoked", value: totals.revoked_count, color: "text-[#B5363A]" },
        ].map((tile) => (
          <div key={tile.label} className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5">
            <p className="text-[11px] text-[#535359] font-semibold">{tile.label}</p>
            <p className={`text-[16px] font-bold ${tile.color}`}>{tile.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Accepted clients */}
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Accepted clients</h3>
        {loadingInvites ? <div className="text-[#A1A1A1] text-[13px]">Loading&hellip;</div> : <AcceptedClientsTable clients={acceptedClients} />}
      </div>

      {/* Pending invites */}
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Pending invites <span className="ml-2 text-[#A1A1A1] text-[12px] font-normal">({pendingInvites.length})</span>
        </h3>
        {loadingInvites ? <div className="text-[#A1A1A1] text-[13px]">Loading&hellip;</div> : (
          <PendingInvitesTable invites={pendingInvites} onResend={handleResendInvite} onRevoke={handleRevokeInvite} auditLogs={auditLogs} />
        )}
      </div>

      {/* Expired invites */}
      {expiredInvites.length > 0 && (
        <div>
          <h3 className="text-[#252525] text-[14px] font-bold mb-3">
            Expired invites <span className="ml-2 text-[#A1A1A1] text-[12px] font-normal">({expiredInvites.length})</span>
          </h3>
          <PendingInvitesTable invites={expiredInvites} onResend={handleResendInvite} onRevoke={handleRevokeInvite} auditLogs={auditLogs} />
        </div>
      )}

      {/* Revoked invites */}
      {revokedInvites.length > 0 && (
        <div>
          <h3 className="text-[#252525] text-[14px] font-bold mb-3">
            Revoked invites <span className="ml-2 text-[#A1A1A1] text-[12px] font-normal">({revokedInvites.length})</span>
          </h3>
          <PendingInvitesTable invites={revokedInvites} onResend={handleResendInvite} onRevoke={handleRevokeInvite} auditLogs={auditLogs} />
        </div>
      )}
    </div>
  );
}
