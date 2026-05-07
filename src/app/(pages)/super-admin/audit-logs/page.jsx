"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getAuditLog, clearDemoState } from "@/lib/demo-state";

const ACTION_LABELS = {
  "user.suspended":  { label: "User suspended",  color: "bg-[#FCEAEB] text-[#B5363A]" },
  "user.reinstated": { label: "User reinstated", color: "bg-[#E5F6EE] text-[#1F7A4A]" },
  "user.invited":    { label: "User invited",    color: "bg-[#EEF4FE] text-[#308BF9]" },
  "user.role_changed":  { label: "Role changed",  color: "bg-[#FFF4E0] text-[#A66B00]" },
  "subscription.reattributed": { label: "Subscription reattributed", color: "bg-[#FFF4E0] text-[#A66B00]" },
};

export default function AuditLogsPage() {
  const [log, setLog] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    setLog(getAuditLog());
  }, [refreshTick]);

  const onClear = () => {
    if (!confirm("Clear all audit log entries and suspensions? Demo data only — does not affect production.")) return;
    clearDemoState();
    setRefreshTick((t) => t + 1);
    toast.success("Demo state cleared.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Audit log
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            Append-only log of every privileged action. Captures actor, target, action,
            reason, and timestamp. <span className="text-[#A66B00] font-semibold">Demo:</span>{" "}
            actions you take in the Super Admin pages (suspend, reinstate, etc.) appear here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick((t) => t + 1)}
            className="rounded-[10px] bg-[#F5F7FA] text-[#535359] text-[12px] font-semibold px-3 py-2"
          >
            Refresh
          </button>
          <button
            onClick={onClear}
            className="rounded-[10px] bg-[#F5F7FA] text-[#535359] text-[12px] font-semibold px-3 py-2"
          >
            Clear demo state
          </button>
        </div>
      </div>

      {log.length === 0 ? (
        <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-8 text-[#A1A1A1] text-[13px] text-center">
          No audit entries yet. Try suspending a trainer or trainer admin from their detail page —
          the action will appear here.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#F5F7FA] text-[#535359] text-left">
                <th className="py-2.5 px-4 font-semibold">When</th>
                <th className="py-2.5 px-4 font-semibold">Action</th>
                <th className="py-2.5 px-4 font-semibold">Actor</th>
                <th className="py-2.5 px-4 font-semibold">Target</th>
                <th className="py-2.5 px-4 font-semibold">Reason</th>
              </tr>
            </thead>
            <tbody>
              {log.map((entry) => {
                const action = ACTION_LABELS[entry.action] || { label: entry.action, color: "bg-[#F5F7FA] text-[#535359]" };
                return (
                  <tr key={entry.id} className="border-t border-[#F5F7FA]">
                    <td className="py-2.5 px-4 text-[#A1A1A1]">
                      {new Date(entry.timestamp).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-flex rounded-full text-[11px] font-semibold px-2.5 py-0.5 ${action.color}`}>
                        {action.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#252525]">{entry.actor_name || entry.actor_user_id}</td>
                    <td className="py-2.5 px-4 text-[#252525]">{entry.target_name || entry.target_user_id}</td>
                    <td className="py-2.5 px-4 text-[#535359] max-w-[400px] truncate" title={entry.reason}>
                      {entry.reason || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
