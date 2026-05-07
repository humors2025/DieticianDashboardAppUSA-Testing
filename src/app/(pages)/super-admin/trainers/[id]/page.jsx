"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TRAINERS,
  TRAINER_ADMINS,
  clientsOf,
  trainerCommissionThisMonth,
  fmtUSDCents,
} from "@/lib/demo-data";
import { isSuspended, getSuspension, getRoleOverride } from "@/lib/demo-state";
import SuspensionDialog from "@/components/admin/SuspensionDialog";
import EditRoleDialog from "@/components/admin/EditRoleDialog";

const TIER_LABEL = { coach: "Coach's Device", lease: "Lease to Own", owned: "Owned" };

export default function TrainerDetailPage({ params }) {
  const { id } = use(params);
  const trainer = TRAINERS.find((t) => t.id === id);

  if (!trainer) notFound();

  const [refreshTick, setRefreshTick] = useState(0);
  const [dialogMode, setDialogMode] = useState(null);

  useEffect(() => {}, [refreshTick]);

  const suspended = isSuspended(trainer.id);
  const suspension = getSuspension(trainer.id);
  const roleOverride = getRoleOverride(trainer.id);
  const currentRole = roleOverride?.role || "trainer";
  const ta = TRAINER_ADMINS.find((t) => t.id === trainer.parent_user_id);
  const myClients = clientsOf(trainer.id);
  const commissionMonth = trainerCommissionThisMonth(trainer.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/super-admin/trainers" className="text-[#308BF9] text-[12px] font-semibold inline-flex items-center gap-1">
        ← Back to Trainers
      </Link>

      <div className="bg-white rounded-[12px] border border-[#E1E6ED] p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[#252525] text-[24px] font-bold tracking-[-0.5px]">
              {trainer.first_name} {trainer.last_name}
            </h1>
            <span className="rounded-full bg-[#2EAF6A] text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wide">
              Trainer
            </span>
            {suspended ? (
              <span className="rounded-full bg-[#FCEAEB] text-[#B5363A] text-[11px] font-semibold px-2.5 py-1">
                Suspended
              </span>
            ) : trainer.status === "active" ? (
              <span className="rounded-full bg-[#E5F6EE] text-[#1F7A4A] text-[11px] font-semibold px-2.5 py-1">
                Active
              </span>
            ) : (
              <span className="rounded-full bg-[#FCEAEB] text-[#B5363A] text-[11px] font-semibold px-2.5 py-1">
                {trainer.status}
              </span>
            )}
          </div>
          <div className="text-[#535359] text-[13px]">
            {trainer.email} · partner code <span className="font-mono">{trainer.partner_code}</span>
          </div>
          <div className="text-[#A1A1A1] text-[11px]">
            Reports to{" "}
            {ta ? (
              <Link href={`/super-admin/trainer-admins/${ta.id}`} className="text-[#308BF9] hover:underline">
                {ta.first_name} {ta.last_name}
              </Link>
            ) : "—"}
            {" · "}joined {trainer.created_at}
          </div>
          {suspended && suspension && (
            <div className="mt-2 rounded-[8px] bg-[#FCEAEB] text-[#B5363A] text-[12px] px-3 py-2">
              Suspended {new Date(suspension.suspended_at).toLocaleDateString()}: {suspension.reason}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          {suspended ? (
            <button onClick={() => setDialogMode("reinstate")} className="rounded-[10px] bg-[#2EAF6A] text-white text-[13px] font-semibold px-4 py-2.5">
              Reinstate
            </button>
          ) : (
            <button onClick={() => setDialogMode("suspend")} className="rounded-[10px] bg-[#E5484D] text-white text-[13px] font-semibold px-4 py-2.5">
              Suspend
            </button>
          )}
          <button
            onClick={() => setDialogMode("edit-role")}
            className="rounded-[10px] bg-white border border-[#E1E6ED] text-[#535359] text-[13px] font-semibold px-4 py-2.5 hover:bg-[#F5F7FA]"
          >
            Edit role
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1">
          <div className="text-[#535359] text-[12px]">Active clients</div>
          <div className="text-[#252525] text-[28px] font-bold">{myClients.filter((c) => c.status === "active").length}</div>
          <div className="text-[#A1A1A1] text-[11px]">of {myClients.length} total</div>
        </div>
        <div className="bg-[#308BF9] rounded-[10px] p-5 text-white flex flex-col gap-1">
          <div className="text-[12px] opacity-80">Commission this month</div>
          <div className="text-[28px] font-bold">{fmtUSDCents(commissionMonth)}</div>
          <div className="text-[11px] opacity-80">20% of their clients' active subscriptions</div>
        </div>
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Their clients</h3>
        {myClients.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
            This trainer hasn't onboarded any clients yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#F5F7FA] text-[#535359] text-left">
                  <th className="py-2.5 px-4 font-semibold">Name</th>
                  <th className="py-2.5 px-4 font-semibold">Tier</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-4 font-semibold">Subscribed</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {myClients.map((c) => (
                  <tr key={c.id} className="border-t border-[#F5F7FA]">
                    <td className="py-2.5 px-4">
                      <Link href={`/super-admin/clients/${c.id}`} className="text-[#308BF9] font-semibold hover:underline">
                        {c.first_name} {c.last_name}
                      </Link>
                      <div className="text-[#A1A1A1] text-[11px]">{c.email}</div>
                    </td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SuspensionDialog
        open={dialogMode === "suspend" || dialogMode === "reinstate"}
        mode={dialogMode}
        target={trainer}
        onClose={() => setDialogMode(null)}
        onConfirm={() => setRefreshTick((t) => t + 1)}
      />

      <EditRoleDialog
        open={dialogMode === "edit-role"}
        target={trainer}
        currentRole={currentRole}
        onClose={() => setDialogMode(null)}
        onConfirm={() => setRefreshTick((t) => t + 1)}
      />
    </div>
  );
}
