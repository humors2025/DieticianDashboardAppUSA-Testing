"use client";

// Scoped to the currently logged-in Trainer Admin. Shows ONLY their own
// network: trainers they recruited + clients under those trainers + their
// override commission. No peer visibility (Evan never sees Derek's data).
//
// Today: reads currentUser from cookie, filters synthetic data by id.
// When backend ships: replace synthetic helpers with GET /api/users/<me>/earnings.

import { useEffect, useState } from "react";
import {
  TRAINER_ADMINS,
  trainersOf,
  clientsUnderTA,
  taOverrideThisMonth,
  fmtUSDCents,
} from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/user";

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

export default function TrainerAdminOverview() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) {
    return <div className="text-[#A1A1A1] text-[13px]">Loading…</div>;
  }

  const taId = user.user_id;
  const taProfile = TRAINER_ADMINS.find((t) => t.id === taId);
  const myTrainers = trainersOf(taId);
  const myClients = clientsUnderTA(taId);
  const activeClients = myClients.filter((c) => c.status === "active");
  const overrideMonth = taOverrideThisMonth(taId);

  const tierMix = {
    coach: activeClients.filter((c) => c.tier === "coach").length,
    lease: activeClients.filter((c) => c.tier === "lease").length,
    owned: activeClients.filter((c) => c.tier === "owned").length,
  };

  const KPIS = [
    { label: "My trainers",         value: myTrainers.length.toString(),         hint: `${myTrainers.filter((t) => t.status === "active").length} active`, accent: true },
    { label: "Clients in network",  value: myClients.length.toString(),          hint: `${activeClients.length} active subscriptions` },
    // { label: "Override this month", value: fmtUSDCents(overrideMonth),           hint: "20% override on your trainers' clients" },
    { label: "Override (year est.)",value: fmtUSDCents(overrideMonth * 12),      hint: "Assuming current activity persists" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Welcome, {user.first_name}!
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            Your network: {myTrainers.length} trainer{myTrainers.length === 1 ? "" : "s"} ·{" "}
            {myClients.length} client{myClients.length === 1 ? "" : "s"} ·{" "}
            partner code <span className="font-mono">{taProfile?.partner_code || user.partner_code || "—"}</span>
          </p>
        </div>
        <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">
          Demo data
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      <div className="bg-[#F5F7FA] rounded-[10px] p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[#252525] text-[14px] font-bold">Tier mix in your network</h3>
          <span className="text-[#A1A1A1] text-[11px]">Active subscriptions only</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: "Coach's Device", value: tierMix.coach, color: "#308BF9" },
            { label: "Lease to Own",   value: tierMix.lease, color: "#2EAF6A" },
            { label: "Owned",          value: tierMix.owned, color: "#F2A93B" },
          ].map((t) => (
            <div key={t.label} className="bg-white rounded-[10px] p-4 border border-[#E1E6ED] flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} aria-hidden />
                <span className="text-[#535359] text-[12px]">{t.label}</span>
              </div>
              <div className="text-[#252525] text-[22px] font-bold">{t.value}</div>
            </div>
          ))}
        </div>
      </div>

      {myTrainers.length === 0 && (
        <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
          You haven't onboarded any trainers yet. Go to <span className="font-semibold">Trainers</span> to send your first invite.
        </div>
      )}
    </div>
  );
}
