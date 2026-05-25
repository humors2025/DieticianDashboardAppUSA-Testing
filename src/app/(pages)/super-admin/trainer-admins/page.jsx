"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  fetchTrainerAdminListService,
  inviteTrainerAdminService,
} from "@/services/authService";

const isValidEmail = (emailAddress) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);

const isValidPhone = (phoneNumber) =>
  /^\+?[0-9\s\-()]{7,}$/.test(phoneNumber);

const formatDateTime = (dateTimeValue) => {
  if (!dateTimeValue) return "-";
  return dateTimeValue;
};


function InviteForm({ onInvitationSent }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  const resetInviteForm = () => {
    setFirstName("");
    setLastName("");
    setEmailAddress("");
    setPhoneNumber("");
  };

  const handleInviteSubmit = async (formSubmitEvent) => {
    formSubmitEvent.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const normalizedEmailAddress = emailAddress.trim().toLowerCase();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (trimmedFirstName.length < 2) {
      return toast.error("First name required.");
    }

    if (trimmedLastName.length < 1) {
      return toast.error("Last name required.");
    }

    if (!isValidEmail(normalizedEmailAddress)) {
      return toast.error("Valid email required.");
    }

    if (!isValidPhone(trimmedPhoneNumber)) {
      return toast.error("Valid phone required.");
    }

    setIsSubmittingInvite(true);

    try {
      const invitationResponse = await inviteTrainerAdminService({
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: normalizedEmailAddress,
        phone: trimmedPhoneNumber,
      });

      const invitationData = invitationResponse?.data;

      const newPendingAdminInvitation = {
        invitation_id: invitationData?.invitation_id || `local-${Date.now()}`,
        name:
          invitationData?.invited_name ||
          `${trimmedFirstName} ${trimmedLastName}`,
        first_name: invitationData?.invited_first_name || trimmedFirstName,
        last_name: invitationData?.invited_last_name || trimmedLastName,
        email: invitationData?.invited_email || normalizedEmailAddress,
        phone_no: invitationData?.invited_phone || trimmedPhoneNumber,
        role: invitationData?.invited_role || "admin",
        partner_code: invitationData?.partner_code || "-",
        invited_by_user_id:
          invitationData?.invited_by_user_id || "connect@respyr.in",
        parent_user_id:
          invitationData?.parent_user_id || "connect@respyr.in",
        status: invitationData?.status || "pending",
        expires_at: invitationData?.expires_at || null,
        sent_at: new Date().toISOString(),
        accepted_at: null,
      };

      onInvitationSent(newPendingAdminInvitation);

      toast.success(
        invitationResponse?.message ||
          `Invite sent to ${newPendingAdminInvitation.name}`
      );

      resetInviteForm();
    } catch (error) {
      console.error("Invite trainer admin failed:", error);

      toast.error(
        error?.data?.message ||
          error?.message ||
          "Could not send invite. Please try again."
      );
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const inputClassName =
    "w-full rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2.5 text-[13px] text-[#252525] focus:outline-none focus:border-[#308BF9]";

  const labelClassName = "text-[#535359] text-[12px] font-semibold";

  return (
    <form
      onSubmit={handleInviteSubmit}
      className="bg-[#F5F7FA] rounded-[10px] p-5 flex flex-col gap-4"
    >
      <div>
        <h3 className="text-[#252525] text-[14px] font-bold">
          Invite a Trainer Admin
        </h3>
        <p className="text-[#535359] text-[12px] mt-1">
          They'll receive an email with a verification link to complete signup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className={labelClassName}>First name</label>
          <input
            className={inputClassName}
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            placeholder="Evan"
            disabled={isSubmittingInvite}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClassName}>Last name</label>
          <input
            className={inputClassName}
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            placeholder="Gaudet"
            disabled={isSubmittingInvite}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClassName}>Email</label>
          <input
            className={inputClassName}
            value={emailAddress}
            onChange={(event) => setEmailAddress(event.target.value)}
            placeholder="evan@example.com"
            inputMode="email"
            disabled={isSubmittingInvite}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClassName}>Phone</label>
          <input
            className={inputClassName}
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="+1 555 123 4567"
            inputMode="tel"
            disabled={isSubmittingInvite}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmittingInvite}
          className="rounded-[10px] bg-[#308BF9] text-white text-[13px] font-semibold px-5 py-2.5 disabled:opacity-60 cursor-pointer"
        >
          {isSubmittingInvite ? "Sending..." : "Send invite"}
        </button>

        <span className="text-[#A1A1A1] text-[11px]">
          Invite will be sent through backend verification flow.
        </span>
      </div>
    </form>
  );
}

function ExistingTrainerAdminsTable({ existingTrainerAdmins }) {
  if (existingTrainerAdmins.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        No Trainer Admins found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-[#F5F7FA] text-[#535359] text-left">
            <th className="py-2.5 px-4 font-semibold">Name</th>
            <th className="py-2.5 px-4 font-semibold">Partner code</th>
            <th className="py-2.5 px-4 font-semibold text-right">
              Trainers
            </th>
            <th className="py-2.5 px-4 font-semibold text-right">Clients</th>
            <th className="py-2.5 px-4 font-semibold">Status</th>
          </tr>
        </thead>

        <tbody>
          {existingTrainerAdmins.map((trainerAdmin) => {
            const trainerAdminStatus = trainerAdmin?.status || "active";

            return (
              <tr
                key={trainerAdmin.role_id || trainerAdmin.user_id}
                className="border-t border-[#F5F7FA] hover:bg-[#F5F7FA]"
              >
                <td className="py-2.5 px-4">
                  <Link
                    href={`/super-admin/trainer-admins/${
                      trainerAdmin.role_id || trainerAdmin.user_id
                    }`}
                    className="text-[#308BF9] font-semibold hover:underline"
                  >
                    {trainerAdmin.name || "-"}
                  </Link>

                  <div className="text-[#A1A1A1] text-[11px]">
                    {trainerAdmin.email || "-"}
                  </div>
                </td>

                <td className="py-2.5 px-4 text-[#535359] font-mono">
                  {trainerAdmin.partner_code || "-"}
                </td>

                <td className="py-2.5 px-4 text-right text-[#252525]">
                  {trainerAdmin.trainers_count ?? 0}
                </td>

                <td className="py-2.5 px-4 text-right text-[#252525]">
                  {trainerAdmin.clients_count ?? 0}
                </td>

                <td className="py-2.5 px-4">
                  <span
                    className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                      trainerAdminStatus === "active"
                        ? "bg-[#E5F6EE] text-[#1F7A4A]"
                        : "bg-[#FCEAEB] text-[#B5363A]"
                    }`}
                  >
                    {trainerAdminStatus}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PendingAdminInvitationsTable({ pendingAdminInvitations }) {
  if (pendingAdminInvitations.length === 0) {
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
            <th className="py-2.5 px-4 font-semibold">Partner code</th>
            <th className="py-2.5 px-4 font-semibold">Status</th>
            <th className="py-2.5 px-4 font-semibold">Expires</th>
          </tr>
        </thead>

        <tbody>
          {pendingAdminInvitations.map((pendingInvitation) => (
            <tr
              key={pendingInvitation.invitation_id}
              className="border-t border-[#F5F7FA]"
            >
              <td className="py-2.5 px-4 text-[#252525] font-semibold">
                {pendingInvitation.name || "-"}
              </td>

              <td className="py-2.5 px-4 text-[#535359]">
                {pendingInvitation.email || "-"}
              </td>

              <td className="py-2.5 px-4 text-[#535359]">
                {pendingInvitation.phone_no || "-"}
              </td>

              <td className="py-2.5 px-4 text-[#535359] font-mono">
                {pendingInvitation.partner_code || "-"}
              </td>

              <td className="py-2.5 px-4">
                <span className="inline-flex rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5">
                  {pendingInvitation.status || "pending"}
                </span>
              </td>

              <td className="py-2.5 px-4 text-[#A1A1A1]">
                {formatDateTime(pendingInvitation.expires_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TrainerAdminsPage() {
  const [existingTrainerAdmins, setExistingTrainerAdmins] = useState([]);
  const [pendingAdminInvitations, setPendingAdminInvitations] = useState([]);
  const [trainerAdminTotals, setTrainerAdminTotals] = useState({
    accepted_count: 0,
    pending_count: 0,
    total_trainers: 0,
    total_clients: 0,
  });

  const [isLoadingTrainerAdmins, setIsLoadingTrainerAdmins] = useState(true);
  const [trainerAdminsErrorMessage, setTrainerAdminsErrorMessage] =
    useState("");

  const loadTrainerAdmins = async () => {
    setIsLoadingTrainerAdmins(true);
    setTrainerAdminsErrorMessage("");

    try {
      const trainerAdminsResponse = await fetchTrainerAdminListService();

      setExistingTrainerAdmins(trainerAdminsResponse?.existing || []);
      setPendingAdminInvitations(
        trainerAdminsResponse?.pending_invites || []
      );
      setTrainerAdminTotals(
        trainerAdminsResponse?.totals || {
          accepted_count: 0,
          pending_count: 0,
          total_trainers: 0,
          total_clients: 0,
        }
      );
    } catch (error) {
      console.error("Fetch trainer admin list failed:", error);

      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Could not load Trainer Admins.";

      setTrainerAdminsErrorMessage(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoadingTrainerAdmins(false);
    }
  };

  useEffect(() => {
    loadTrainerAdmins();
  }, []);

  const handleAdminInvitationSent = (newAdminInvitation) => {
    setPendingAdminInvitations((currentPendingInvitations) => [
      newAdminInvitation,
      ...currentPendingInvitations,
    ]);

    setTrainerAdminTotals((currentTotals) => ({
      ...currentTotals,
      pending_count: Number(currentTotals.pending_count || 0) + 1,
    }));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Trainer Admins
          </h1>

          <p className="text-[#535359] text-[13px] mt-1">
            Invite and manage Trainer Admins. They onboard their own trainers
            and earn commission on their network.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTrainerAdmins}
          disabled={isLoadingTrainerAdmins}
          className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-3 py-1 disabled:opacity-60 cursor-pointer"
        >
          {isLoadingTrainerAdmins ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-[10px] border border-[#E1E6ED] p-4">
          <p className="text-[#A1A1A1] text-[11px] font-semibold">
            Accepted Admins
          </p>
          <h3 className="text-[#252525] text-[20px] font-bold mt-1">
            {trainerAdminTotals.accepted_count ?? 0}
          </h3>
        </div>

        <div className="rounded-[10px] border border-[#E1E6ED] p-4">
          <p className="text-[#A1A1A1] text-[11px] font-semibold">
            Pending Invites
          </p>
          <h3 className="text-[#252525] text-[20px] font-bold mt-1">
            {trainerAdminTotals.pending_count ?? 0}
          </h3>
        </div>

        <div className="rounded-[10px] border border-[#E1E6ED] p-4">
          <p className="text-[#A1A1A1] text-[11px] font-semibold">
            Total Trainers
          </p>
          <h3 className="text-[#252525] text-[20px] font-bold mt-1">
            {trainerAdminTotals.total_trainers ?? 0}
          </h3>
        </div>

        <div className="rounded-[10px] border border-[#E1E6ED] p-4">
          <p className="text-[#A1A1A1] text-[11px] font-semibold">
            Total Clients
          </p>
          <h3 className="text-[#252525] text-[20px] font-bold mt-1">
            {trainerAdminTotals.total_clients ?? 0}
          </h3>
        </div>
      </div>

      <InviteForm onInvitationSent={handleAdminInvitationSent} />

      {trainerAdminsErrorMessage ? (
        <div className="rounded-[10px] border border-[#FCEAEB] bg-[#FFF7F7] p-4 text-[#B5363A] text-[12px]">
          {trainerAdminsErrorMessage}
        </div>
      ) : null}

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Existing Trainer Admins
        </h3>

        {isLoadingTrainerAdmins ? (
          <div className="rounded-[10px] border border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
            Loading Trainer Admins...
          </div>
        ) : (
          <ExistingTrainerAdminsTable
            existingTrainerAdmins={existingTrainerAdmins}
          />
        )}
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Pending invites
        </h3>

        {isLoadingTrainerAdmins ? (
          <div className="rounded-[10px] border border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
            Loading pending invites...
          </div>
        ) : (
          <PendingAdminInvitationsTable
            pendingAdminInvitations={pendingAdminInvitations}
          />
        )}
      </div>
    </div>
  );
}















// "use client";

// import { useState } from "react";
// import Link from "next/link";
// import { toast } from "sonner";
// import {
//   TRAINER_ADMINS,
//   trainersOf,
//   clientsUnderTA,
//   taOverrideThisMonth,
//   fmtUSDCents,
// } from "@/lib/demo-data";
// import { isSuspended } from "@/lib/demo-state";

// async function inviteTrainerAdmin({ firstName, lastName, email, phone }) {
//   await new Promise((r) => setTimeout(r, 400));
//   return {
//     ok: true,
//     invite: {
//       id: `local-${Date.now()}`,
//       first_name: firstName,
//       last_name: lastName,
//       email,
//       phone,
//       status: "Sent",
//       sentAt: new Date().toISOString(),
//     },
//   };
// }

// const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
// const isValidPhone = (p) => /^\+?[0-9\s\-()]{7,}$/.test(p);

// function InviteForm({ onSent }) {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const reset = () => {
//     setFirstName(""); setLastName(""); setEmail(""); setPhone("");
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     if (firstName.trim().length < 2) return toast.error("First name required.");
//     if (lastName.trim().length < 1)  return toast.error("Last name required.");
//     if (!isValidEmail(email))         return toast.error("Valid email required.");
//     if (!isValidPhone(phone))         return toast.error("Valid phone required.");

//     setSubmitting(true);
//     try {
//       const res = await inviteTrainerAdmin({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim() });
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
//         <h3 className="text-[#252525] text-[14px] font-bold">Invite a Trainer Admin</h3>
//         <p className="text-[#535359] text-[12px] mt-1">
//           They'll receive an email with a verification link to complete signup.
//         </p>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//         <div className="flex flex-col gap-1"><label className={labelClass}>First name</label><input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Evan" /></div>
//         <div className="flex flex-col gap-1"><label className={labelClass}>Last name</label><input className={fieldClass} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Gaudet" /></div>
//         <div className="flex flex-col gap-1"><label className={labelClass}>Email</label><input className={fieldClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="evan@example.com" inputMode="email" /></div>
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

// function ExistingTAsTable() {
//   return (
//     <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
//       <table className="w-full text-[12px]">
//         <thead>
//           <tr className="bg-[#F5F7FA] text-[#535359] text-left">
//             <th className="py-2.5 px-4 font-semibold">Name</th>
//             <th className="py-2.5 px-4 font-semibold">Partner code</th>
//             <th className="py-2.5 px-4 font-semibold text-right">Trainers</th>
//             <th className="py-2.5 px-4 font-semibold text-right">Clients</th>
//             <th className="py-2.5 px-4 font-semibold text-right">Override / mo</th>
//             <th className="py-2.5 px-4 font-semibold">Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {TRAINER_ADMINS.map((ta) => {
//             const taSuspended = isSuspended(ta.id);
//             return (
//               <tr key={ta.id} className="border-t border-[#F5F7FA] hover:bg-[#F5F7FA]">
//                 <td className="py-2.5 px-4">
//                   <Link href={`/super-admin/trainer-admins/${ta.id}`} className="text-[#308BF9] font-semibold hover:underline">
//                     {ta.first_name} {ta.last_name}
//                   </Link>
//                   <div className="text-[#A1A1A1] text-[11px]">{ta.email}</div>
//                 </td>
//                 <td className="py-2.5 px-4 text-[#535359] font-mono">{ta.partner_code}</td>
//                 <td className="py-2.5 px-4 text-right text-[#252525]">{trainersOf(ta.id).length}</td>
//                 <td className="py-2.5 px-4 text-right text-[#252525]">{clientsUnderTA(ta.id).length}</td>
//                 <td className="py-2.5 px-4 text-right text-[#252525] font-semibold">{fmtUSDCents(taOverrideThisMonth(ta.id))}</td>
//                 <td className="py-2.5 px-4">
//                   <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
//                     taSuspended ? "bg-[#FCEAEB] text-[#B5363A]" :
//                     ta.status === "active" ? "bg-[#E5F6EE] text-[#1F7A4A]" :
//                     "bg-[#FCEAEB] text-[#B5363A]"
//                   }`}>
//                     {taSuspended ? "suspended" : ta.status}
//                   </span>
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// function PendingInvitesTable({ rows }) {
//   if (rows.length === 0) {
//     return (
//       <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
//         No invites pending. Use the form above to invite a new Trainer Admin.
//       </div>
//     );
//   }
//   return (
//     <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
//       <table className="w-full text-[12px]">
//         <thead>
//           <tr className="bg-[#F5F7FA] text-[#535359] text-left">
//             <th className="py-2.5 px-4 font-semibold">Name</th>
//             <th className="py-2.5 px-4 font-semibold">Email</th>
//             <th className="py-2.5 px-4 font-semibold">Phone</th>
//             <th className="py-2.5 px-4 font-semibold">Status</th>
//             <th className="py-2.5 px-4 font-semibold">Sent</th>
//           </tr>
//         </thead>
//         <tbody>
//           {rows.map((r) => (
//             <tr key={r.id} className="border-t border-[#F5F7FA]">
//               <td className="py-2.5 px-4 text-[#252525] font-semibold">{r.first_name} {r.last_name}</td>
//               <td className="py-2.5 px-4 text-[#535359]">{r.email}</td>
//               <td className="py-2.5 px-4 text-[#535359]">{r.phone}</td>
//               <td className="py-2.5 px-4"><span className="inline-flex rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-2.5 py-0.5">{r.status}</span></td>
//               <td className="py-2.5 px-4 text-[#A1A1A1]">{new Date(r.sentAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default function TrainerAdminsPage() {
//   const [invites, setInvites] = useState([]);

//   return (
//     <div className="flex flex-col gap-6">
//       <div className="flex items-start justify-between gap-4 flex-wrap">
//         <div>
//           <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
//             Trainer Admins
//           </h1>
//           <p className="text-[#535359] text-[13px] mt-1">
//             Invite and manage Trainer Admins. They onboard their own trainers and earn 20% override commission on their network.
//           </p>
//         </div>
//         <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">Demo data</span>
//       </div>

//       <InviteForm onSent={(inv) => setInvites((list) => [inv, ...list])} />

//       <div>
//         <h3 className="text-[#252525] text-[14px] font-bold mb-3">Existing Trainer Admins</h3>
//         <ExistingTAsTable />
//       </div>

//       <div>
//         <h3 className="text-[#252525] text-[14px] font-bold mb-3">Pending invites</h3>
//         <PendingInvitesTable rows={invites} />
//       </div>
//     </div>
//   );
// }
