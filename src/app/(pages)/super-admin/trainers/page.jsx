"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TRAINERS,
  TRAINER_ADMINS,
  clientsOf,
  trainerCommissionThisMonth,
  fmtUSDCents,
} from "@/lib/demo-data";

export default function SuperAdminTrainersPage() {
  const [q, setQ] = useState("");
  const [taFilter, setTaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const taById = useMemo(
    () => Object.fromEntries(TRAINER_ADMINS.map((ta) => [ta.id, ta])),
    []
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return TRAINERS.filter((t) => {
      if (taFilter !== "all" && t.parent_user_id !== taFilter) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        `${t.first_name} ${t.last_name}`.toLowerCase().includes(needle) ||
        t.email.toLowerCase().includes(needle) ||
        (t.partner_code || "").toLowerCase().includes(needle)
      );
    });
  }, [q, taFilter, statusFilter]);

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
        <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">Demo data</span>
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
          {TRAINER_ADMINS.map((ta) => (
            <option key={ta.id} value={ta.id}>{ta.first_name} {ta.last_name}</option>
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
              <th className="py-2.5 px-4 font-semibold text-right">Commission / mo</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const ta = taById[t.parent_user_id];
              return (
                <tr key={t.id} className="border-t border-[#F5F7FA] hover:bg-[#F5F7FA]">
                  <td className="py-2.5 px-4">
                    <Link href={`/super-admin/trainers/${t.id}`} className="text-[#308BF9] font-semibold hover:underline">
                      {t.first_name} {t.last_name}
                    </Link>
                    <div className="text-[#A1A1A1] text-[11px]">{t.email}</div>
                  </td>
                  <td className="py-2.5 px-4 text-[#535359]">{ta ? `${ta.first_name} ${ta.last_name}` : "—"}</td>
                  <td className="py-2.5 px-4 text-[#535359] font-mono">{t.partner_code}</td>
                  <td className="py-2.5 px-4 text-right text-[#252525]">{clientsOf(t.id).length}</td>
                  <td className="py-2.5 px-4 text-right text-[#252525] font-semibold">{fmtUSDCents(trainerCommissionThisMonth(t.id))}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${t.status === "active" ? "bg-[#E5F6EE] text-[#1F7A4A]" : "bg-[#FCEAEB] text-[#B5363A]"}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]">No trainers match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
