"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { getCurrentUser } from "@/lib/user";
import { fetchDownstreamUsersService } from "@/services/authService";

function KpiCard({ label, value, hint, accent, pending, href }) {
  const content = (
    <>
      <div className={accent ? "text-[12px] opacity-80" : "text-[#535359] text-[12px]"}>{label}</div>
      <div className={`text-[28px] font-bold leading-none mt-1 ${accent ? "" : "text-[#252525]"}`}>
        {pending ? "—" : value}
      </div>
      <div className={accent ? "text-[11px] opacity-80 mt-1" : "text-[#A1A1A1] text-[11px] mt-1"}>{hint}</div>
    </>
  );

  const className = accent
    ? "bg-[#308BF9] rounded-[10px] p-5 text-white flex flex-col gap-1 hover:bg-[#1a76e8] transition-colors"
    : "bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1 hover:border-[#308BF9] transition-colors";

  if (href) {
    return <Link href={href} className={className}>{content}</Link>;
  }
  return <div className={className}>{content}</div>;
}

export default function TrainerAdminOverview() {
  const [user, setUser] = useState(null);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async (currentUser) => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await fetchDownstreamUsersService(currentUser.user_id);
      setTotals(res?.totals || {});
    } catch (err) {
      toast.error(err?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    loadData(u);
  }, [loadData]);

  if (!user) {
    return <div className="text-[#A1A1A1] text-[13px]">Loading...</div>;
  }

  const trainerCount = totals?.total_trainers ?? totals?.accepted_count ?? 0;
  const clientCount = totals?.total_clients ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Welcome, {user.first_name}!
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            Your network: {trainerCount} trainer
            {trainerCount === 1 ? "" : "s"} · {clientCount} client
            {clientCount === 1 ? "" : "s"} · partner code{" "}
            <span className="font-mono">
              {user.partner_code || "—"}
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadData(user)}
          disabled={loading}
          className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-3 py-1 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="My trainers"
          value={String(trainerCount)}
          hint="In your network"
          accent
          href="/trainer-admin/trainers"
        />
        <KpiCard
          label="Clients in network"
          value={String(clientCount)}
          hint="Total across all trainers"
          href="/trainer-admin/trainers"
        />
      </div>

      {trainerCount === 0 && (
        <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
          You haven't onboarded any trainers yet. Go to{" "}
          <span className="font-semibold">Trainers</span> to send your first
          invite.
        </div>
      )}
    </div>
  );
}
