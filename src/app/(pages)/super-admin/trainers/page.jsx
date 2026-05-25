"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  fetchTrainerAdminListService,
  fetchDownstreamUsersService,
} from "@/services/authService";
import { getCurrentUser } from "@/lib/user";

export default function SuperAdminTrainersPage() {
  const [trainerAdmins, setTrainerAdmins] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [taFilter, setTaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const taRes = await fetchTrainerAdminListService();
      const taList = taRes?.existing || [];

      const currentUser = getCurrentUser();
      const fullTaList = [...taList];
      if (currentUser?.role === "super_admin" && currentUser?.partner_code) {
        const alreadyInList = taList.some(
          (ta) => ta.user_id === currentUser.user_id || ta.partner_code === currentUser.partner_code
        );
        if (!alreadyInList) {
          fullTaList.unshift({
            user_id: currentUser.user_id,
            name: `${currentUser.first_name} ${currentUser.last_name}`.trim() || "Super Admin",
            email: currentUser.email || currentUser.user_id,
            partner_code: currentUser.partner_code,
            dietician_id: currentUser.partner_code,
          });
        }
      }

      setTrainerAdmins(fullTaList);

      const allTrainers = [];

      for (const ta of fullTaList) {
        if (ta.dietician_id || ta.partner_code) {
          allTrainers.push({
            role_id: `ta-trainer-${ta.user_id}`,
            user_id: ta.user_id,
            name: ta.name || ta.user_id,
            email: ta.email || ta.user_id,
            partner_code: ta.partner_code,
            dietician_id: ta.dietician_id || ta.partner_code,
            clients_count: ta.clients_count ?? 0,
            status: ta.status || "active",
            created_at: ta.created_at,
            ta_user_id: ta.user_id,
            ta_name: ta.name || ta.user_id,
          });
        }

        try {
          const trainerRes = await fetchDownstreamUsersService(ta.user_id);
          const trainerList = (trainerRes?.existing || []).map((t) => ({
            ...t,
            ta_user_id: ta.user_id,
            ta_name: ta.name || ta.user_id,
          }));
          allTrainers.push(...trainerList);
        } catch {}
      }
      setTrainers(allTrainers);
    } catch (err) {
      toast.error(err?.message || "Failed to load trainers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return trainers.filter((t) => {
      if (taFilter !== "all" && t.ta_user_id !== taFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        (t.name || "").toLowerCase().includes(needle) ||
        (t.email || t.user_id || "").toLowerCase().includes(needle) ||
        (t.partner_code || "").toLowerCase().includes(needle)
      );
    });
  }, [trainers, q, taFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Trainers
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Trainers
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            All trainers in the network. Filter by Trainer Admin or status, search by name / email / partner code.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-3 py-1 cursor-pointer"
        >
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, or code"
          className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px] flex-1 min-w-[240px] focus:outline-none focus:border-[#308BF9]"
        />
        <select
          value={taFilter}
          onChange={(e) => setTaFilter(e.target.value)}
          className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px]"
        >
          <option value="all">All Trainer Admins</option>
          {trainerAdmins.map((ta) => (
            <option key={ta.user_id} value={ta.user_id}>
              {ta.name || ta.user_id}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px]"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F5F7FA] text-[#535359] text-left">
              <th className="py-2.5 px-4 font-semibold">Name</th>
              <th className="py-2.5 px-4 font-semibold">Trainer Admin</th>
              <th className="py-2.5 px-4 font-semibold">Partner code</th>
              <th className="py-2.5 px-4 font-semibold text-right">Clients</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
              <th className="py-2.5 px-4 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.role_id || t.user_id}
                className="border-t border-[#F5F7FA] hover:bg-[#F5F7FA]"
              >
                <td className="py-2.5 px-4">
                  <Link
                    href={`/super-admin/trainers/${t.role_id || encodeURIComponent(t.user_id)}?dietician_id=${encodeURIComponent(t.dietician_id || t.partner_code || "")}&name=${encodeURIComponent(t.name || t.user_id)}`}
                    className="text-[#308BF9] font-semibold hover:underline"
                  >
                    {t.name || t.user_id}
                  </Link>
                  <div className="text-[#A1A1A1] text-[11px]">
                    {t.email || t.user_id}
                  </div>
                </td>
                <td className="py-2.5 px-4 text-[#535359]">
                  {t.ta_name}
                </td>
                <td className="py-2.5 px-4 text-[#535359] font-mono">
                  {t.partner_code || "-"}
                </td>
                <td className="py-2.5 px-4 text-right text-[#252525]">
                  {t.clients_count ?? 0}
                </td>
                <td className="py-2.5 px-4">
                  <span
                    className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                      t.status === "active"
                        ? "bg-[#E5F6EE] text-[#1F7A4A]"
                        : "bg-[#FCEAEB] text-[#B5363A]"
                    }`}
                  >
                    {t.status || "active"}
                  </span>
                </td>
                <td className="py-2.5 px-4 text-[#A1A1A1]">
                  {t.created_at
                    ? new Date(t.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "-"}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]"
                >
                  {trainers.length === 0
                    ? "No trainers in the network yet."
                    : "No trainers match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
