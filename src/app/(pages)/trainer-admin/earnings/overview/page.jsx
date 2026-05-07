"use client";

import { useEffect, useState } from "react";
import {
  trainersOf,
  clientsUnderTA,
  taOverrideThisMonth,
  trainerCommissionThisMonth,
  fmtUSDCents,
} from "@/lib/demo-data";
import { getCurrentUser } from "@/lib/user";

export default function TrainerAdminEarningsOverview() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  if (!user) return <div className="text-[#A1A1A1] text-[13px]">Loading…</div>;

  const taId = user.user_id;
  const myTrainers = trainersOf(taId);
  const myClients = clientsUnderTA(taId);
  const activeClients = myClients.filter((c) => c.status === "active");
  const overrideMonth = taOverrideThisMonth(taId);

  // Override per trainer (their clients × 20%)
  const perTrainerOverride = myTrainers
    .map((t) => ({
      trainer: t,
      override: trainerCommissionThisMonth(t.id),
    }))
    .sort((a, b) => b.override - a.override);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[#252525] text-[16px] font-bold">Overview</h2>
        <p className="text-[#535359] text-[13px] mt-1">
          Your override commission breakdown — this month, lifetime estimate, and per-trainer attribution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#308BF9] rounded-[10px] p-5 text-white">
          <div className="text-[12px] opacity-80">Override this month</div>
          <div className="text-[28px] font-bold mt-1">{fmtUSDCents(overrideMonth)}</div>
          <div className="text-[11px] opacity-80 mt-1">{activeClients.length} active client{activeClients.length === 1 ? "" : "s"}</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
          <div className="text-[#535359] text-[12px]">Annual projection</div>
          <div className="text-[#252525] text-[28px] font-bold mt-1">{fmtUSDCents(overrideMonth * 12)}</div>
          <div className="text-[#A1A1A1] text-[11px] mt-1">If current activity persists</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
          <div className="text-[#535359] text-[12px]">Pending payout</div>
          <div className="text-[#252525] text-[28px] font-bold mt-1">{fmtUSDCents(overrideMonth)}</div>
          <div className="text-[#A1A1A1] text-[11px] mt-1">Next payout: 1st of next month</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
          <div className="text-[#535359] text-[12px]">Lifetime earnings</div>
          <div className="text-[#252525] text-[28px] font-bold mt-1">{fmtUSDCents(overrideMonth * 2)}</div>
          <div className="text-[#A1A1A1] text-[11px] mt-1">Demo placeholder</div>
        </div>
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Override by trainer</h3>
        {perTrainerOverride.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
            You haven't recruited any trainers yet. No override commission to display.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#F5F7FA] text-[#535359] text-left">
                  <th className="py-2.5 px-4 font-semibold">Trainer</th>
                  <th className="py-2.5 px-4 font-semibold">Partner code</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Your override / mo</th>
                </tr>
              </thead>
              <tbody>
                {perTrainerOverride.map(({ trainer, override }) => (
                  <tr key={trainer.id} className="border-t border-[#F5F7FA]">
                    <td className="py-2.5 px-4">
                      <div className="text-[#252525] font-semibold">{trainer.first_name} {trainer.last_name}</div>
                      <div className="text-[#A1A1A1] text-[11px]">{trainer.email}</div>
                    </td>
                    <td className="py-2.5 px-4 text-[#535359] font-mono">{trainer.partner_code}</td>
                    <td className="py-2.5 px-4 text-right text-[#252525] font-semibold">{fmtUSDCents(override)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#E1E6ED]">
                  <td className="py-3 px-4 text-[#252525] font-bold" colSpan={2}>Total</td>
                  <td className="py-3 px-4 text-right text-[#252525] font-bold">{fmtUSDCents(overrideMonth)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
