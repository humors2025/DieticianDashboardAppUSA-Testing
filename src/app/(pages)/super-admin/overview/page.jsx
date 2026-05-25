"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { fetchTrainerAdminListService } from "@/services/authService";
import { getCurrentUser } from "@/lib/user";

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
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export default function SuperAdminOverview() {
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTrainerAdminListService();
      setTotals(res?.totals || {});
    } catch (err) {
      toast.error(err?.message || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentUser = getCurrentUser();
  const saIsAlsoTA = currentUser?.role === "super_admin" && currentUser?.partner_code;
  const taCount = (totals?.accepted_count ?? 0) + (saIsAlsoTA ? 1 : 0);
  const trainerCount = totals?.total_trainers ?? 0;
  const clientCount = totals?.total_clients ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Overview
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            A full-network snapshot — trainer admins, trainers, clients, and
            revenue.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-3 py-1 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          label="Trainer Admins"
          value={String(taCount)}
          hint="Active in the network"
          accent
          href="/super-admin/trainer-admins"
        />
        <KpiCard
          label="Trainers"
          value={String(trainerCount)}
          hint="Across all Trainer Admins"
          href="/super-admin/trainers"
        />
        <KpiCard
          label="Clients"
          value={String(clientCount)}
          hint="Total in network"
          href="/super-admin/clients"
        />
      </div>

      <div className="bg-[#F5F7FA] rounded-[10px] p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[#252525] text-[14px] font-bold">
            Conversion funnel
          </h3>
          <span className="text-[#A1A1A1] text-[11px]">
            Trainer Admin → Trainer → Client
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "Trainer Admins", value: String(taCount), href: "/super-admin/trainer-admins" },
            { label: "Trainers onboarded", value: String(trainerCount), href: "/super-admin/trainers" },
            { label: "Clients onboarded", value: String(clientCount), href: "/super-admin/clients" },
          ].map((s, i) => {
            const inner = (
              <>
                <div className="text-[#A1A1A1] text-[11px] font-semibold uppercase tracking-wide">
                  Step {i + 1}
                </div>
                <div className="text-[#535359] text-[12px]">{s.label}</div>
                <div className="text-[#252525] text-[22px] font-bold mt-1">
                  {s.pending ? (
                    <span className="text-[#A1A1A1]">—</span>
                  ) : (
                    s.value
                  )}
                </div>
              </>
            );

            return s.href ? (
              <Link
                key={s.label}
                href={s.href}
                className="bg-white rounded-[10px] p-4 border border-[#E1E6ED] flex flex-col gap-1 hover:border-[#308BF9] transition-colors"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={s.label}
                className="bg-white rounded-[10px] p-4 border border-[#E1E6ED] flex flex-col gap-1"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-[#F5F7FA] rounded-[10px] p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-[#252525] text-[14px] font-bold">
            Client mix by tier
          </h3>
          <span className="text-[#A1A1A1] text-[11px]">API pending</span>
        </div>
        <div className="rounded-[10px] border border-dashed border-[#E1E6ED] bg-white p-6 text-[#A1A1A1] text-[12px] text-center">
          Tier breakdown requires a dedicated aggregation API.
        </div>
      </div>
    </div>
  );
}
