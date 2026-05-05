"use client";

import {
  TRAINER_ADMINS,
  TRAINERS,
  trainerCommissionThisMonth,
  taOverrideThisMonth,
  fmtUSDCents,
} from "@/lib/demo-data";

// Synthesizes a "this month" payout pipeline from the demo data:
//   Each TA has a row for their override commission.
//   Each trainer has a row for their direct commission.
// Real data comes from the `commissions` and `payouts` tables once the
// Stripe webhook handler ships.

function computeRows() {
  const taRows = TRAINER_ADMINS.map((ta) => ({
    id: `payout-${ta.id}`,
    recipient_id: ta.id,
    recipient_name: `${ta.first_name} ${ta.last_name}`,
    recipient_role: "trainer_admin",
    level: "override",
    amount_cents: taOverrideThisMonth(ta.id),
    status: "pending",
  }));
  const trainerRows = TRAINERS.map((t) => ({
    id: `payout-${t.id}`,
    recipient_id: t.id,
    recipient_name: `${t.first_name} ${t.last_name}`,
    recipient_role: "trainer",
    level: "direct",
    amount_cents: trainerCommissionThisMonth(t.id),
    status: "pending",
  }));
  return [...taRows, ...trainerRows].filter((r) => r.amount_cents > 0);
}

const ROLE_LABEL = { trainer_admin: "Trainer Admin", trainer: "Trainer" };
const LEVEL_LABEL = { direct: "Direct (20%)", override: "Override (20%)" };

export default function PayoutsPage() {
  const rows = computeRows();
  const total = rows.reduce((s, r) => s + r.amount_cents, 0);
  const overrideTotal = rows.filter((r) => r.level === "override").reduce((s, r) => s + r.amount_cents, 0);
  const directTotal = rows.filter((r) => r.level === "direct").reduce((s, r) => s + r.amount_cents, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[#252525] text-[20px] font-bold leading-tight tracking-[-0.4px]">
            Payouts
          </h1>
          <p className="text-[#535359] text-[13px] mt-1">
            Pending and paid commissions across the network. Pipeline view of what's owed
            to each Trainer and Trainer Admin this month.
          </p>
        </div>
        <span className="rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-3 py-1">Demo data</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#308BF9] rounded-[10px] p-5 text-white">
          <div className="text-[12px] opacity-80">Total pending this month</div>
          <div className="text-[28px] font-bold mt-1">{fmtUSDCents(total)}</div>
          <div className="text-[11px] opacity-80 mt-1">{rows.length} recipients</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
          <div className="text-[#535359] text-[12px]">Direct (Trainers)</div>
          <div className="text-[#252525] text-[28px] font-bold mt-1">{fmtUSDCents(directTotal)}</div>
          <div className="text-[#A1A1A1] text-[11px] mt-1">20% on each trainer's clients</div>
        </div>
        <div className="bg-white rounded-[10px] p-5 border border-[#E1E6ED]">
          <div className="text-[#535359] text-[12px]">Override (Trainer Admins)</div>
          <div className="text-[#252525] text-[28px] font-bold mt-1">{fmtUSDCents(overrideTotal)}</div>
          <div className="text-[#A1A1A1] text-[11px] mt-1">20% on their network's clients</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-[#E1E6ED]">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-[#F5F7FA] text-[#535359] text-left">
              <th className="py-2.5 px-4 font-semibold">Recipient</th>
              <th className="py-2.5 px-4 font-semibold">Role</th>
              <th className="py-2.5 px-4 font-semibold">Level</th>
              <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[#F5F7FA]">
                <td className="py-2.5 px-4 text-[#252525] font-semibold">{r.recipient_name}</td>
                <td className="py-2.5 px-4 text-[#535359]">{ROLE_LABEL[r.recipient_role]}</td>
                <td className="py-2.5 px-4 text-[#535359]">{LEVEL_LABEL[r.level]}</td>
                <td className="py-2.5 px-4 text-right text-[#252525] font-semibold">{fmtUSDCents(r.amount_cents)}</td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex rounded-full bg-[#FFF4E0] text-[#A66B00] text-[11px] font-semibold px-2.5 py-0.5">
                    pending
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-[#A1A1A1] text-[11px]">
        When the Stripe Connect cron runs (1st of each month), pending rows are batched into
        Stripe Transfers. The <code>transfer.paid</code> webhook flips status to{" "}
        <span className="font-semibold">paid</span> and creates a <code>payouts</code> row.
      </p>
    </div>
  );
}
