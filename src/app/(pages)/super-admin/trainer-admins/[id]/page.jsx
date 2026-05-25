"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  TRAINER_ADMINS,
  trainersOf,
  clientsUnderTA,
  taOverrideThisMonth,
  trainerCommissionThisMonth,
  clientsOf,
  fmtUSDCents,
} from "@/lib/demo-data";
import { isSuspended, getSuspension, getRoleOverride } from "@/lib/demo-state";
import SuspensionDialog from "@/components/admin/SuspensionDialog";
import EditRoleDialog from "@/components/admin/EditRoleDialog";

export default function TrainerAdminDetailPage({ params }) {
  const { id } = use(params);
  const ta = TRAINER_ADMINS.find((t) => t.id === id);

  if (!ta) notFound();

  const [refreshTick, setRefreshTick] = useState(0);
  const [dialogMode, setDialogMode] = useState(null); // 'suspend' | 'reinstate' | 'edit-role'

  useEffect(() => {}, [refreshTick]);

  const suspended = isSuspended(ta.id);
  const suspension = getSuspension(ta.id);
  const roleOverride = getRoleOverride(ta.id);
  const currentRole = roleOverride?.role || "trainer_admin";
  const myTrainers = trainersOf(ta.id);
  const myClients = clientsUnderTA(ta.id);
  const overrideMonth = taOverrideThisMonth(ta.id);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/super-admin/trainer-admins" className="text-[#308BF9] text-[12px] font-semibold inline-flex items-center gap-1">
        ← Back to Trainer Admins
      </Link>

      <div className="bg-white rounded-[12px] border border-[#E1E6ED] p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[#252525] text-[24px] font-bold tracking-[-0.5px]">
              {ta.first_name} {ta.last_name}
            </h1>
            <span className="rounded-full bg-[#308BF9] text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wide">
              Trainer Admin
            </span>
            {suspended ? (
              <span className="rounded-full bg-[#FCEAEB] text-[#B5363A] text-[11px] font-semibold px-2.5 py-1">
                Suspended
              </span>
            ) : (
              <span className="rounded-full bg-[#E5F6EE] text-[#1F7A4A] text-[11px] font-semibold px-2.5 py-1">
                Active
              </span>
            )}
          </div>
          <div className="text-[#535359] text-[13px]">
            {ta.email} · {ta.phone} · partner code <span className="font-mono">{ta.partner_code}</span>
          </div>
          <div className="text-[#A1A1A1] text-[11px]">
            Joined {ta.created_at}
          </div>
          {suspended && suspension && (
            <div className="mt-2 rounded-[8px] bg-[#FCEAEB] text-[#B5363A] text-[12px] px-3 py-2">
              Suspended {new Date(suspension.suspended_at).toLocaleDateString()}: {suspension.reason}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 items-end">
          {suspended ? (
            <button
              onClick={() => setDialogMode("reinstate")}
              className="rounded-[10px] bg-[#2EAF6A] text-white text-[13px] font-semibold px-4 py-2.5"
            >
              Reinstate
            </button>
          ) : (
            <button
              onClick={() => setDialogMode("suspend")}
              className="rounded-[10px] bg-[#E5484D] text-white text-[13px] font-semibold px-4 py-2.5"
            >
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
          <div className="text-[#535359] text-[12px]">Trainers in network</div>
          <div className="text-[#252525] text-[28px] font-bold">{myTrainers.length}</div>
          <div className="text-[#A1A1A1] text-[11px]">{myTrainers.filter((t) => t.status === "active" && !isSuspended(t.id)).length} active</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1">
          <div className="text-[#535359] text-[12px]">Clients under network</div>
          <div className="text-[#252525] text-[28px] font-bold">{myClients.length}</div>
          <div className="text-[#A1A1A1] text-[11px]">{myClients.filter((c) => c.status === "active").length} active subscriptions</div>
        </div>
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">Trainers in this network</h3>
        <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#F5F7FA] text-[#535359] text-left">
                <th className="py-2.5 px-4 font-semibold">Name</th>
                <th className="py-2.5 px-4 font-semibold">Partner code</th>
                <th className="py-2.5 px-4 font-semibold text-right">Clients</th>
                <th className="py-2.5 px-4 font-semibold text-right">Commission / mo</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {myTrainers.map((t) => {
                const tSuspended = isSuspended(t.id);
                return (
                  <tr key={t.id} className="border-t border-[#F5F7FA] hover:bg-[#F5F7FA]">
                    <td className="py-2.5 px-4">
                      <Link href={`/super-admin/trainers/${t.id}`} className="text-[#308BF9] font-semibold hover:underline">
                        {t.first_name} {t.last_name}
                      </Link>
                      <div className="text-[#A1A1A1] text-[11px]">{t.email}</div>
                    </td>
                    <td className="py-2.5 px-4 text-[#535359] font-mono">{t.partner_code}</td>
                    <td className="py-2.5 px-4 text-right text-[#252525]">{clientsOf(t.id).length}</td>
                    <td className="py-2.5 px-4 text-right text-[#252525] font-semibold">{fmtUSDCents(trainerCommissionThisMonth(t.id))}</td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                        tSuspended ? "bg-[#FCEAEB] text-[#B5363A]" :
                        t.status === "active" ? "bg-[#E5F6EE] text-[#1F7A4A]" :
                        "bg-[#FCEAEB] text-[#B5363A]"
                      }`}>
                        {tSuspended ? "suspended" : t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <SuspensionDialog
        open={dialogMode === "suspend" || dialogMode === "reinstate"}
        mode={dialogMode}
        target={ta}
        onClose={() => setDialogMode(null)}
        onConfirm={() => setRefreshTick((t) => t + 1)}
      />

      <EditRoleDialog
        open={dialogMode === "edit-role"}
        target={ta}
        currentRole={currentRole}
        onClose={() => setDialogMode(null)}
        onConfirm={() => setRefreshTick((t) => t + 1)}
      />
    </div>
  );
}
