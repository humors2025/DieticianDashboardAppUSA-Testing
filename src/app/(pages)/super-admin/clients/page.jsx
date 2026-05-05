"use client";

import { useMemo, useState } from "react";
import { CLIENTS, TRAINERS, fmtUSDCents } from "@/lib/demo-data";

const TIER_LABEL = { coach: "Coach's Device", lease: "Lease to Own", owned: "Owned" };

export default function SuperAdminClientsPage() {
  const [q, setQ] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");

  const trainerById = useMemo(
    () => Object.fromEntries(TRAINERS.map((t) => [t.id, t])),
    []
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CLIENTS.filter((c) => {
      if (trainerFilter !== "all" && c.parent_user_id !== trainerFilter) return false;
      if (tierFilter !== "all" && c.tier !== tierFilter) return false;
      if (!needle) return true;
      return (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle)
      );
    });
  }, [q, trainerFilter, tierFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Clients
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            All clients across the network. Filter by trainer or tier.
          </p>
        </div>
        <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">Demo data</span>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email"
          className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px] flex-1 min-w-[240px] focus:outline-none focus:border-[#308BF9]"
        />
        <select
          value={trainerFilter}
          onChange={(e) => setTrainerFilter(e.target.value)}
          className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px]"
        >
          <option value="all">All trainers</option>
          {TRAINERS.map((t) => (
            <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
          ))}
        </select>
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="rounded-[10px] border border-[#E1E6ED] bg-white px-3 py-2 text-[12px]"
        >
          <option value="all">All tiers</option>
          <option value="coach">Coach's Device</option>
          <option value="lease">Lease to Own</option>
          <option value="owned">Owned</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F5F7FA] text-[#535359] text-left">
              <th className="py-2.5 px-4 font-semibold">Name</th>
              <th className="py-2.5 px-4 font-semibold">Trainer</th>
              <th className="py-2.5 px-4 font-semibold">Tier</th>
              <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
              <th className="py-2.5 px-4 font-semibold">Subscribed</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const trainer = trainerById[c.parent_user_id];
              return (
                <tr key={c.id} className="border-t border-[#F5F7FA]">
                  <td className="py-2.5 px-4">
                    <div className="text-[#252525] font-semibold">{c.first_name} {c.last_name}</div>
                    <div className="text-[#A1A1A1] text-[11px]">{c.email}</div>
                  </td>
                  <td className="py-2.5 px-4 text-[#535359]">{trainer ? `${trainer.first_name} ${trainer.last_name}` : "—"}</td>
                  <td className="py-2.5 px-4 text-[#535359]">{TIER_LABEL[c.tier]}</td>
                  <td className="py-2.5 px-4 text-right text-[#252525]">{fmtUSDCents(c.amount_paid)}</td>
                  <td className="py-2.5 px-4 text-[#A1A1A1]">{c.subscribed_at}</td>
                  <td className="py-2.5 px-4">
                    <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                      c.status === "active" ? "bg-[#E5F6EE] text-[#1F7A4A]" :
                      c.status === "past_due" ? "bg-[#FFF4E0] text-[#A66B00]" :
                      "bg-[#FCEAEB] text-[#B5363A]"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="py-8 px-4 text-center text-[#A1A1A1] text-[12px]">No clients match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
