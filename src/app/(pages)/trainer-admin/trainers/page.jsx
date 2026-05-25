"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { fetchTrainerClientInvitesService } from "@/services/authService";

function getLoggedInUserFromCookie() {
  const token = Cookies.get("access_token");
  if (token) {
    try {
      const payload = token.split(".")[1];
      const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64).split("").map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`).join("")
      );
      return JSON.parse(jsonPayload);
    } catch { /* fall through */ }
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

export default function TrainerAdminTrainersPage() {
  const [user, setUser] = useState(null);
  const [inviteOwners, setInviteOwners] = useState([]);
  const [clientCounts, setClientCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const actorUserId = getActorUserIdFromCookie();
    if (!actorUserId) return;

    setLoading(true);
    try {
      const res = await fetchTrainerClientInvitesService({ actorUserId });
      const owners = res?.invite_owners || [];
      setInviteOwners(owners);

      const counts = {};
      await Promise.all(
        owners
          .filter((o) => o.dietician_id)
          .map((o) =>
            fetch("/api/admin/trainer-clients", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ dietician_id: o.dietician_id, page: 1 }),
            })
              .then((r) => r.json())
              .then((d) => { counts[o.dietician_id] = d?.summary?.all_total ?? 0; })
              .catch(() => { counts[o.dietician_id] = 0; })
          )
      );
      setClientCounts(counts);
    } catch (err) {
      toast.error(err?.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setUser(getLoggedInUserFromCookie());
    loadData();
  }, [loadData]);

  if (!user) return <div className="text-[#A1A1A1] text-[13px]">Loading&hellip;</div>;

  const totalTrainers = inviteOwners.length;
  const totalClients = Object.values(clientCounts).reduce((sum, c) => sum + c, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Trainers
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            Trainers in your network and their client activity.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-3 py-1 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#308BF9] rounded-[10px] p-5 text-white flex flex-col gap-1">
          <div className="text-[12px] opacity-80">Trainers in network</div>
          <div className="text-[28px] font-bold">{totalTrainers}</div>
          <div className="text-[11px] opacity-80">Including yourself</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1">
          <div className="text-[#535359] text-[12px]">Total clients</div>
          <div className="text-[#252525] text-[28px] font-bold">{totalClients}</div>
          <div className="text-[#A1A1A1] text-[11px]">Across all trainers</div>
        </div>
      </div>

      {/* Trainers table */}
      {loading ? (
        <div className="text-[#A1A1A1] text-[13px]">Loading&hellip;</div>
      ) : inviteOwners.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
          No trainers in your network yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#F5F7FA] text-[#535359] text-left">
                <th className="py-2.5 px-4 font-semibold">Name</th>
                <th className="py-2.5 px-4 font-semibold">Partner code</th>
                <th className="py-2.5 px-4 font-semibold">Role</th>
                <th className="py-2.5 px-4 font-semibold text-right">Clients</th>
                <th className="py-2.5 px-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {inviteOwners.map((owner) => {
                const clients = clientCounts[owner.dietician_id] ?? 0;
                return (
                  <tr
                    key={owner.user_id}
                    className={`border-t border-[#F5F7FA] ${owner.is_self ? "bg-[#EEF4FE]/50" : ""}`}
                  >
                    <td className="py-2.5 px-4">
                      <div className="text-[#252525] font-semibold">
                        {owner.name || owner.user_id}
                        {owner.is_self && (
                          <span className="text-[#308BF9] text-[10px] font-normal ml-1.5">(you)</span>
                        )}
                      </div>
                      <div className="text-[#A1A1A1] text-[11px]">{owner.email || owner.user_id}</div>
                    </td>
                    <td className="py-2.5 px-4 text-[#535359] font-mono">
                      {owner.dietician_id || owner.partner_code || "-"}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex rounded-full text-[10px] font-semibold px-2 py-0.5 ${
                        owner.is_admin_as_trainer || owner.is_super_admin_as_trainer
                          ? "bg-[#EEF4FE] text-[#308BF9]"
                          : "bg-[#E5F6EE] text-[#1F7A4A]"
                      }`}>
                        {owner.is_self ? "You (Trainer Admin)" : owner.is_admin_as_trainer ? "Trainer Admin" : "Trainer"}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#252525] font-semibold">
                      {clients}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {owner.is_self ? (
                        <Link
                          href="/trainer/dashboard"
                          className="rounded-full bg-[#2EAF6A] text-white text-[11px] font-semibold px-3 py-1 hover:bg-[#259B5C] transition-colors"
                        >
                          View my clients
                        </Link>
                      ) : (
                        <span className="text-[#A1A1A1] text-[11px]">
                          {clients} client{clients === 1 ? "" : "s"} referred
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
