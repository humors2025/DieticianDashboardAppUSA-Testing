"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  inviteTrainerClientService,
  fetchTrainerClientInvitesService,
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
        .map((char) => {
          return `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`;
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function getLoggedInUserFromCookie() {
  const token = Cookies.get("access_token");
  if (!token) return null;

  return decodeJwt(token);
}

function getTrainerIdFromCookie() {
  const decoded = getLoggedInUserFromCookie();

  return decoded?.dietician_id ?? decoded?.sub ?? null;
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

  return {
    first_name: parts[0] ?? "",
    last_name: parts.slice(1).join(" "),
  };
}

function normalizeInvite(invite = {}) {
  const { first_name, last_name } = splitClientName(invite.client_name);

  return {
    id: invite.invite_id ?? `${invite.client_email}-${invite.created_at}`,
    first_name,
    last_name,
    email: invite.client_email ?? "",
    phone: invite.client_mobile ?? "",
    status: invite.status ?? "sent",
    sentAt: invite.created_at ?? invite.updated_at ?? new Date().toISOString(),
    acceptedAt: invite.accepted_at ?? null,
    acceptedProfileId: invite.accepted_profile_id ?? null,
    trainer_name: invite.trainer_name ?? "",
    trainer_code: invite.trainer_code ?? "",
  };
}

function formatInviteDate(dateValue) {
  if (!dateValue) return "-";

  const normalized =
    typeof dateValue === "string" ? dateValue.replace(" ", "T") : dateValue;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Validators
// ---------------------------------------------------------------------------
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const isValidPhone = (p) => /^\+?[0-9\s\-()]{7,}$/.test(p);

// ---------------------------------------------------------------------------
// InviteForm — calls send_trainer_client_invite API
// ---------------------------------------------------------------------------
function InviteForm({ onSent }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (firstName.trim().length < 2) return toast.error("First name required.");
    if (lastName.trim().length < 1) return toast.error("Last name required.");
    if (!isValidEmail(email)) return toast.error("Valid email required.");
    if (!isValidPhone(phone)) return toast.error("Valid phone required.");

    const trainerId = getTrainerIdFromCookie();

    if (!trainerId) {
      return toast.error("Session expired. Please log in again.");
    }

    setSubmitting(true);

    try {
      const res = await inviteTrainerClientService({
        trainerID: trainerId,
        clientName: `${firstName.trim()} ${lastName.trim()}`,
        clientMobile: phone.trim(),
        clientEmail: email.trim(),
      });

      await onSent({
        invite_id: res?.data?.invite_id ?? `invite-${Date.now()}`,
        client_name:
          res?.data?.client_name ?? `${firstName.trim()} ${lastName.trim()}`,
        client_mobile: res?.data?.client_mobile ?? phone.trim(),
        client_email: res?.data?.client_email ?? email.trim(),
        status: res?.data?.invite_status ?? res?.data?.status ?? "sent",
        created_at: res?.data?.created_at ?? new Date().toISOString(),
        trainer_name: res?.data?.trainer_name ?? "",
        trainer_code: res?.data?.trainer_code ?? "",
      });

      toast.success(`Invite sent to ${firstName.trim()} ${lastName.trim()}`);
      reset();
    } catch (err) {
      toast.error(err?.message || "Could not send invite. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] placeholder-[#C4C9D4] focus:outline-none focus:border-[#308BF9] transition-colors";
  const labelClass = "text-[#535359] text-[12px] font-semibold";

  return (
    <form
      onSubmit={onSubmit}
      className="bg-[#F5F7FA] rounded-[10px] p-5 flex flex-col gap-4"
    >
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold">Invite a Client</h3>
        <p className="text-[#535359] text-[12px] mt-1">
          They'll receive an email invite. Once they sign up, they'll be linked to
          your trainer account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClass}>First name</label>
          <input
            className={fieldClass}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Marcus"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Last name</label>
          <input
            className={fieldClass}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Hill"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Email</label>
          <input
            className={fieldClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="marcus@example.com"
            inputMode="email"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass}>Phone</label>
          <input
            className={fieldClass}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 123 4567"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60 hover:bg-[#1a76e8] transition-colors"
        >
          {submitting ? "Sending…" : "Send invite"}
        </button>
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

    return clients.filter((client) => {
      return (
        `${client.first_name} ${client.last_name}`
          .toLowerCase()
          .includes(needle) ||
        client.email.toLowerCase().includes(needle) ||
        client.phone.toLowerCase().includes(needle) ||
        String(client.acceptedProfileId || "").toLowerCase().includes(needle)
      );
    });
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
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone, or profile"
          className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px] flex-1 min-w-[200px] focus:outline-none focus:border-[#308BF9] transition-colors"
        />
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
                <td className="py-2.5 px-4 text-[#252525] font-semibold">
                  {client.first_name} {client.last_name}
                </td>

                <td className="py-2.5 px-4 text-[#535359]">{client.email}</td>

                <td className="py-2.5 px-4 text-[#535359]">{client.phone}</td>

                <td className="py-2.5 px-4 text-[#535359] font-mono">
                  {client.acceptedProfileId || "-"}
                </td>

                <td className="py-2.5 px-4">
                  <span className="inline-flex rounded-full bg-[#E5F6EE] text-[#1F7A4A] text-[11px] font-semibold px-2.5 py-0.5">
                    {client.status}
                  </span>
                </td>

                <td className="py-2.5 px-4 text-[#A1A1A1]">
                  {formatInviteDate(client.acceptedAt)}
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]"
                >
                  No clients match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PendingInvitesTable
// Same UI is used for pending_invites and failed_invites
// ---------------------------------------------------------------------------
function PendingInvitesTable({ invites }) {
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
          {invites.map((inv) => (
            <tr key={inv.id} className="border-t border-[#F5F7FA]">
              <td className="py-2.5 px-4 text-[#252525] font-semibold">
                {inv.first_name} {inv.last_name}
              </td>

              <td className="py-2.5 px-4 text-[#535359]">{inv.email}</td>

              <td className="py-2.5 px-4 text-[#535359]">{inv.phone}</td>

              <td className="py-2.5 px-4">
                <span className="inline-flex rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5">
                  {inv.status}
                </span>
              </td>

              <td className="py-2.5 px-4 text-[#A1A1A1]">
                {formatInviteDate(inv.sentAt)}
              </td>
            </tr>
          ))}

          {invites.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]"
              >
                No pending invites found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TrainerAdminTrainersPage() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [acceptedClients, setAcceptedClients] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);

  const [loadingInvites, setLoadingInvites] = useState(false);
  const [inviteListError, setInviteListError] = useState("");

  const loadTrainerClientInvites = useCallback(async () => {
    const actorUserId = getActorUserIdFromCookie();

    if (!actorUserId) {
      setInviteListError("Session expired. Please log in again.");
      return;
    }

    setLoadingInvites(true);
    setInviteListError("");

    try {
      const res = await fetchTrainerClientInvitesService({
        actorUserId,
      });

      const acceptedClientList = Array.isArray(res?.accepted_clients)
        ? res.accepted_clients
        : [];

      const pendingInviteList = Array.isArray(res?.pending_invites)
        ? res.pending_invites
        : [];

      const failedInviteList = Array.isArray(res?.failed_invites)
        ? res.failed_invites
        : [];

      setAcceptedClients(acceptedClientList.map(normalizeInvite));

      setPendingInvites(
        [...pendingInviteList, ...failedInviteList].map(normalizeInvite)
      );
    } catch (err) {
      const message =
        err?.message || "Could not fetch client invites. Please try again.";

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

    loadTrainerClientInvites();
  }, [loadTrainerClientInvites]);

  if (checkingSession) {
    return <div className="text-[#A1A1A1] text-[13px]">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="text-[#A1A1A1] text-[13px]">
        Session expired. Please log in again.
      </div>
    );
  }

  const handleInviteSent = async (invite) => {
    const normalizedInvite = normalizeInvite(invite);

    setPendingInvites((prev) => [
      normalizedInvite,
      ...prev.filter((item) => item.id !== normalizedInvite.id),
    ]);

    await loadTrainerClientInvites();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Trainers
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            Trainers you've recruited into the Respyr program. You earn 20%
            override on every active subscription their clients hold.
          </p>
        </div>

        <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">
          Demo data
        </span>
      </div>

      {/* Invite form */}
      <InviteForm onSent={handleInviteSent} />

      {inviteListError && (
        <div className="rounded-[10px] border border-[#FCEAEB] bg-[#FFF7F7] text-[#B5363A] text-[12px] p-3">
          {inviteListError}
        </div>
      )}

      {/* Accepted clients */}
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Accepted clients
        </h3>

        {loadingInvites ? (
          <div className="text-[#A1A1A1] text-[13px]">Loading…</div>
        ) : (
          <AcceptedClientsTable clients={acceptedClients} />
        )}
      </div>

      {/* Pending invites */}
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Pending invites
        </h3>

        {loadingInvites ? (
          <div className="text-[#A1A1A1] text-[13px]">Loading…</div>
        ) : (
          <PendingInvitesTable invites={pendingInvites} />
        )}
      </div>
    </div>
  );
}





// "use client";

// // Trainer Admin's view of THEIR trainers only. Filtered by parent_user_id ===
// // currentUser.user_id so Evan never sees Derek's trainers (and vice versa).
// //
// // Backend equivalent: GET /api/users?role=trainer (server scopes to caller's
// // downstream; UI doesn't pass any filter — the auth context does the work).

// import { useEffect, useMemo, useState } from "react";
// import { toast } from "sonner";
// import {
//   trainersOf,
//   clientsOf,
//   trainerCommissionThisMonth,
//   fmtUSDCents,
// } from "@/lib/demo-data";
// import { getCurrentUser } from "@/lib/user";

// async function inviteTrainer({ firstName, lastName, email, phone, taId }) {
//   // STUB. When backend ships:
//   //   POST /api/invites { role: 'trainer', first_name, last_name, email, phone }
//   //   inviter_user_id is set server-side from the auth context (= taId).
//   await new Promise((r) => setTimeout(r, 400));
//   return {
//     ok: true,
//     invite: {
//       id: `local-${Date.now()}`,
//       first_name: firstName,
//       last_name: lastName,
//       email,
//       phone,
//       taId,
//       status: "Sent",
//       sentAt: new Date().toISOString(),
//     },
//   };
// }

// const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
// const isValidPhone = (p) => /^\+?[0-9\s\-()]{7,}$/.test(p);

// function InviteForm({ taId, onSent }) {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const reset = () => { setFirstName(""); setLastName(""); setEmail(""); setPhone(""); };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     if (firstName.trim().length < 2) return toast.error("First name required.");
//     if (lastName.trim().length < 1)  return toast.error("Last name required.");
//     if (!isValidEmail(email))         return toast.error("Valid email required.");
//     if (!isValidPhone(phone))         return toast.error("Valid phone required.");

//     setSubmitting(true);
//     try {
//       const res = await inviteTrainer({
//         firstName: firstName.trim(), lastName: lastName.trim(),
//         email: email.trim(), phone: phone.trim(), taId,
//       });
//       if (!res.ok) throw new Error("Failed");
//       onSent(res.invite);
//       toast.success(`Invite sent to ${res.invite.first_name} ${res.invite.last_name}`);
//       reset();
//     } catch {
//       toast.error("Could not send invite. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const fieldClass = "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9]";
//   const labelClass = "text-[#535359] text-[12px] font-semibold";

//   return (
//     <form onSubmit={onSubmit} className="bg-[#F5F7FA] rounded-[10px] p-5 flex flex-col gap-4">
//       <div>
//         <h3 className="text-[#252525] text-[14px] font-bold">Invite a Trainer</h3>
//         <p className="text-[#535359] text-[12px] mt-1">
//           They'll get an email with a verification link. Once they sign up, you'll
//           earn 20% override on every client they onboard.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div className="flex flex-col gap-1"><label className={labelClass}>First name</label><input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Marcus" /></div>
//         <div className="flex flex-col gap-1"><label className={labelClass}>Last name</label><input className={fieldClass} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Hill" /></div>
//         <div className="flex flex-col gap-1"><label className={labelClass}>Email</label><input className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="marcus@example.com" inputMode="email" /></div>
//         <div className="flex flex-col gap-1"><label className={labelClass}>Phone</label><input className={fieldClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" inputMode="tel" /></div>
//       </div>

//       <div className="flex items-center gap-3">
//         <button type="submit" disabled={submitting} className="rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60">
//           {submitting ? "Sending..." : "Send invite"}
//         </button>
//         <span className="text-[#A1A1A1] text-[11px]">Backend wiring (Resend email + verification flow) is pending.</span>
//       </div>
//     </form>
//   );
// }

// function TrainersTable({ trainers }) {
//   const [q, setQ] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const filtered = useMemo(() => {
//     const needle = q.trim().toLowerCase();
//     return trainers.filter((t) => {
//       if (statusFilter !== "all" && t.status !== statusFilter) return false;
//       if (!needle) return true;
//       return (
//         `${t.first_name} ${t.last_name}`.toLowerCase().includes(needle) ||
//         t.email.toLowerCase().includes(needle) ||
//         (t.partner_code || "").toLowerCase().includes(needle)
//       );
//     });
//   }, [trainers, q, statusFilter]);

//   if (trainers.length === 0) {
//     return (
//       <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
//         You haven't onboarded any trainers yet. Use the form above to invite your first one.
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="flex flex-wrap gap-3 items-center mb-3">
//         <input
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//           placeholder="Search name, email, or code"
//           className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px] flex-1 min-w-[200px] focus:outline-none focus:border-[#308BF9]"
//         />
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px]"
//         >
//           <option value="all">All statuses</option>
//           <option value="active">Active</option>
//           <option value="suspended">Suspended</option>
//         </select>
//       </div>

//       <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
//         <table className="w-full text-[12px]">
//           <thead>
//             <tr className="bg-[#F5F7FA] text-[#535359] text-left">
//               <th className="py-2.5 px-4 font-semibold">Name</th>
//               <th className="py-2.5 px-4 font-semibold">Partner code</th>
//               <th className="py-2.5 px-4 font-semibold text-right">Clients</th>
//               <th className="py-2.5 px-4 font-semibold text-right">Their commission / mo</th>
//               <th className="py-2.5 px-4 font-semibold">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((t) => (
//               <tr key={t.id} className="border-t border-[#F5F7FA]">
//                 <td className="py-2.5 px-4">
//                   <div className="text-[#252525] font-semibold">{t.first_name} {t.last_name}</div>
//                   <div className="text-[#A1A1A1] text-[11px]">{t.email}</div>
//                 </td>
//                 <td className="py-2.5 px-4 text-[#535359] font-mono">{t.partner_code}</td>
//                 <td className="py-2.5 px-4 text-right text-[#252525]">{clientsOf(t.id).length}</td>
//                 <td className="py-2.5 px-4 text-right text-[#252525] font-semibold">{fmtUSDCents(trainerCommissionThisMonth(t.id))}</td>
//                 <td className="py-2.5 px-4">
//                   <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${t.status === "active" ? "bg-[#E5F6EE] text-[#1F7A4A]" : "bg-[#FCEAEB] text-[#B5363A]"}`}>
//                     {t.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr><td colSpan={5} className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]">No trainers match your filters.</td></tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </>
//   );
// }

// export default function TrainerAdminTrainersPage() {
//   const [user, setUser] = useState(null);
//   const [pendingInvites, setPendingInvites] = useState([]);

//   useEffect(() => {
//     setUser(getCurrentUser());
//   }, []);

//   if (!user) {
//     return <div className="text-[#A1A1A1] text-[13px]">Loading…</div>;
//   }

//   const myTrainers = trainersOf(user.user_id);

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex items-start justify-between gap-4 flex-wrap">
//         <div>
//           <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
//             Trainers
//           </h1>
//           <p className="text-[#535359] text-[13px] mt-1">
//             Trainers you've recruited into the Respyr program. You earn 20% override on
//             every active subscription their clients hold.
//           </p>
//         </div>
//         <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">Demo data</span>
//       </div>

//       <InviteForm
//         taId={user.user_id}
//         onSent={(inv) => setPendingInvites((list) => [inv, ...list])}
//       />

//       <div>
//         <h3 className="text-[#252525] text-[14px] font-bold mb-3">Your trainers</h3>
//         <TrainersTable trainers={myTrainers} />
//       </div>

//       {pendingInvites.length > 0 && (
//         <div>
//           <h3 className="text-[#252525] text-[14px] font-bold mb-3">Pending invites</h3>
//           <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
//             <table className="w-full text-[12px]">
//               <thead>
//                 <tr className="bg-[#F5F7FA] text-[#535359] text-left">
//                   <th className="py-2.5 px-4 font-semibold">Name</th>
//                   <th className="py-2.5 px-4 font-semibold">Email</th>
//                   <th className="py-2.5 px-4 font-semibold">Phone</th>
//                   <th className="py-2.5 px-4 font-semibold">Status</th>
//                   <th className="py-2.5 px-4 font-semibold">Sent</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {pendingInvites.map((inv) => (
//                   <tr key={inv.id} className="border-t border-[#F5F7FA]">
//                     <td className="py-2.5 px-4 text-[#252525] font-semibold">{inv.first_name} {inv.last_name}</td>
//                     <td className="py-2.5 px-4 text-[#535359]">{inv.email}</td>
//                     <td className="py-2.5 px-4 text-[#535359]">{inv.phone}</td>
//                     <td className="py-2.5 px-4"><span className="inline-flex rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5">{inv.status}</span></td>
//                     <td className="py-2.5 px-4 text-[#A1A1A1]">{new Date(inv.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
