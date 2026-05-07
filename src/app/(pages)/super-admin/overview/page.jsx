"use client";

import { networkSummary, fmtUSDCents } from "@/lib/demo-data";

const summary = networkSummary();

const KPIS = [
  { label: "Trainer Admins",     value: summary.trainerAdmins.toString(),                       hint: "Active in the network",            accent: true },
  { label: "Trainers",           value: summary.trainers.toString(),                            hint: `${summary.activeTrainers} active` },
  { label: "Clients",            value: summary.clients.toString(),                             hint: `${summary.activeClients} active subscriptions` },
  { label: "This-month revenue", value: fmtUSDCents(summary.monthRevenueCents),                 hint: "Gross before commission" },
];

const FUNNEL_STEPS = [
  { label: "Trainer Admins",     value: summary.trainerAdmins.toString() },
  { label: "Trainers onboarded", value: summary.trainers.toString() },
  { label: "Clients onboarded",  value: summary.clients.toString() },
  { label: "Subscribed",         value: summary.activeClients.toString() },
];

const TIER_MIX = [
  { label: "Coach's Device", value: summary.tierMix.coach.toString(), color: "#308BF9" },
  { label: "Lease to Own",   value: summary.tierMix.lease.toString(), color: "#2EAF6A" },
  { label: "Owned",          value: summary.tierMix.owned.toString(), color: "#F2A93B" },
];

function KpiCard({ label, value, hint, accent }) {
  if (accent) {
    return (
      <div className="bg-[#308BF9] rounded-[10px] p-5 text-white flex flex-col gap-1">
        <div className="text-[12px] opacity-80">{label}</div>
        <div className="text-[28px] font-bold leading-none mt-1">{value}</div>
        <div className="text-[11px] opacity-80 mt-1">{hint}</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1">
      <div className="text-[#535359] text-[12px]">{label}</div>
      <div className="text-[#252525] text-[28px] font-bold leading-none mt-1">{value}</div>
      <div className="text-[#A1A1A1] text-[11px] mt-1">{hint}</div>
    </div>
  );
}

export default function SuperAdminOverview() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Overview
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            A full-network snapshot — trainer admins, trainers, clients, conversion, and revenue.
          </p>
        </div>
        <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">
          Demo data
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="bg-[#F5F7FA] rounded-[10px] p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[#252525] text-[14px] font-bold">Conversion funnel</h3>
          <span className="text-[#A1A1A1] text-[11px]">
            Trainer Admin → Trainer → Client → Subscribed
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FUNNEL_STEPS.map((s, i) => (
            <div
              key={s.label}
              className="bg-white rounded-[10px] p-4 border border-[#E1E6ED] flex flex-col gap-1"
            >
              <div className="text-[#A1A1A1] text-[11px] font-semibold uppercase tracking-wide">
                Step {i + 1}
              </div>
              <div className="text-[#535359] text-[12px]">{s.label}</div>
              <div className="text-[#252525] text-[22px] font-bold mt-1">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#F5F7FA] rounded-[10px] p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[#252525] text-[14px] font-bold">Client mix by tier</h3>
          <span className="text-[#A1A1A1] text-[11px]">Active subscriptions</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIER_MIX.map((t) => (
            <div
              key={t.label}
              className="bg-white rounded-[10px] p-4 border border-[#E1E6ED] flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: t.color }}
                  aria-hidden
                />
                <span className="text-[#535359] text-[12px]">{t.label}</span>
              </div>
              <div className="text-[#252525] text-[22px] font-bold">{t.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
