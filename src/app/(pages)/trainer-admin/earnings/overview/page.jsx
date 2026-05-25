"use client";

import { useEffect, useState } from "react";
import {
  trainersOf,
  clientsUnderTA,
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[#252525] text-[16px] font-bold">Overview</h2>
        <p className="text-[#535359] text-[13px] mt-1">
          Your earnings breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[#308BF9] rounded-[10px] p-5 text-white">
          <div className="text-[12px] opacity-80">Earnings this month</div>
          <div className="text-[28px] font-bold mt-1">—</div>
          <div className="text-[11px] opacity-80 mt-1">{activeClients.length} active client{activeClients.length === 1 ? "" : "s"}</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
          <div className="text-[#535359] text-[12px]">Pending payout</div>
          <div className="text-[#252525] text-[28px] font-bold mt-1">—</div>
          <div className="text-[#A1A1A1] text-[11px] mt-1">Next payout: 1st of next month</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
          <div className="text-[#535359] text-[12px]">Lifetime earnings</div>
          <div className="text-[#252525] text-[28px] font-bold mt-1">—</div>
          <div className="text-[#A1A1A1] text-[11px] mt-1">Earnings API pending</div>
        </div>
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Trainers in your network</h3>
        {myTrainers.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
            No trainers in your network yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#F5F7FA] text-[#535359] text-left">
                  <th className="py-2.5 px-4 font-semibold">Trainer</th>
                  <th className="py-2.5 px-4 font-semibold">Partner code</th>
                </tr>
              </thead>
              <tbody>
                {myTrainers.map((trainer) => (
                  <tr key={trainer.id} className="border-t border-[#F5F7FA]">
                    <td className="py-2.5 px-4">
                      <div className="text-[#252525] font-semibold">{trainer.first_name} {trainer.last_name}</div>
                      <div className="text-[#A1A1A1] text-[11px]">{trainer.email}</div>
                    </td>
                    <td className="py-2.5 px-4 text-[#535359] font-mono">{trainer.partner_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
