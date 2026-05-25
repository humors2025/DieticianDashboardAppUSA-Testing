"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function TrainerDetailPage({ params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const dieticianId = searchParams.get("dietician_id") || "";
  const trainerName = searchParams.get("name") || id;

  const [clients, setClients] = useState([]);
  const [summary, setSummary] = useState({ all_total: 0, tested_total: 0, missed_total: 0 });
  const [loading, setLoading] = useState(true);

  const loadClients = useCallback(async () => {
    if (!dieticianId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let allClients = [];
      let page = 1;
      let fetchedSummary = { all_total: 0, tested_total: 0, missed_total: 0 };

      while (true) {
        const res = await fetch("/api/admin/trainer-clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dietician_id: dieticianId, page }),
        });
        const data = await res.json();

        if (page === 1) {
          fetchedSummary = data?.summary || fetchedSummary;
        }

        const batch = data?.clients || [];
        allClients = [...allClients, ...batch];

        if (batch.length < 10 || allClients.length >= (fetchedSummary.all_total || 0)) {
          break;
        }
        page++;
      }

      setClients(allClients);
      setSummary(fetchedSummary);
    } catch (err) {
      toast.error(err?.message || "Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [dieticianId]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/super-admin/trainers"
        className="text-[#308BF9] text-[12px] font-semibold inline-flex items-center gap-1"
      >
        &larr; Back to Trainers
      </Link>

      <div className="bg-white rounded-[12px] border border-[#E1E6ED] p-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[#252525] text-[24px] font-bold tracking-[-0.5px]">
              {trainerName}
            </h1>
            <span className="rounded-full bg-[#2EAF6A] text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-wide">
              Trainer
            </span>
          </div>
          {dieticianId && (
            <div className="text-[#535359] text-[13px]">
              Dietician ID: <span className="font-mono">{dieticianId}</span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={loadClients}
          disabled={loading}
          className="rounded-full bg-[#EEF4FE] text-[#308BF9] text-[11px] font-semibold px-3 py-1 cursor-pointer disabled:opacity-60"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1">
          <div className="text-[#535359] text-[12px]">Total clients</div>
          <div className="text-[#252525] text-[28px] font-bold">
            {summary.all_total}
          </div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1">
          <div className="text-[#535359] text-[12px]">Tested</div>
          <div className="text-[#252525] text-[28px] font-bold">
            {summary.tested_total}
          </div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED] flex flex-col gap-1">
          <div className="text-[#535359] text-[12px]">Missed</div>
          <div className="text-[#252525] text-[28px] font-bold">
            {summary.missed_total}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[#252525] text-[14px] font-bold mb-3">
          Clients ({clients.length})
        </h3>

        {loading ? (
          <div className="text-[#A1A1A1] text-[13px]">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
            This trainer hasn't onboarded any clients yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#F5F7FA] text-[#535359] text-left">
                  <th className="py-2.5 px-4 font-semibold">Name</th>
                  <th className="py-2.5 px-4 font-semibold">Email</th>
                  <th className="py-2.5 px-4 font-semibold">Profile ID</th>
                  <th className="py-2.5 px-4 font-semibold">Fitness Goal</th>
                  <th className="py-2.5 px-4 font-semibold text-right">
                    Metabolism Score
                  </th>
                  <th className="py-2.5 px-4 font-semibold">Zone</th>
                  <th className="py-2.5 px-4 font-semibold text-right">
                    Tests
                  </th>
                  <th className="py-2.5 px-4 font-semibold">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr
                    key={c.profile_id}
                    className="border-t border-[#F5F7FA] hover:bg-[#F5F7FA]"
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        {c.p_image && (
                          <img
                            src={c.p_image}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <div className="text-[#252525] font-semibold">
                          {c.client_name || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-[#535359]">
                      {c.email || "-"}
                    </td>
                    <td className="py-2.5 px-4 text-[#535359] font-mono">
                      {c.profile_id || "-"}
                    </td>
                    <td className="py-2.5 px-4 text-[#535359]">
                      {c.fitness_goal_display || c.fitness_goal || "-"}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {c.metabolism_score != null ? (
                        <span className="text-[#252525] font-semibold">
                          {c.metabolism_score}
                        </span>
                      ) : (
                        <span className="text-[#A1A1A1]">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {c.zone ? (
                        <span
                          className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${
                            c.zone === "Optimal"
                              ? "bg-[#E5F6EE] text-[#1F7A4A]"
                              : c.zone === "Moderate"
                              ? "bg-[#FFF4E0] text-[#A66B00]"
                              : "bg-[#FCEAEB] text-[#B5363A]"
                          }`}
                        >
                          {c.zone}
                        </span>
                      ) : (
                        <span className="text-[#A1A1A1]">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right text-[#252525]">
                      {c.test_taken_count ?? 0}
                    </td>
                    <td className="py-2.5 px-4 text-[#A1A1A1]">
                      {c.last_logged || "-"}
                    </td>
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
