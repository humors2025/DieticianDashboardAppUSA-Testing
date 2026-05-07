export default function TrainerAdminEarningsPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-[#252525] text-[20px] font-bold">Earnings</h1>
      <p className="text-[#535359] text-[13px]">
        Your override commission breakdown — this month, lifetime, pending payout,
        and per-trainer attribution.
      </p>
      <div className="rounded-[10px] border border-dashed border-[#E1E6ED] p-6 text-[#A1A1A1] text-[12px] text-center">
        Coming in a follow-up PR. Mirrors the trainer's <code>/trainer/earnings</code>{" "}
        layout but reads override-level commissions from{" "}
        <code>GET /api/users/&lt;me&gt;/earnings?level=override</code>.
      </div>
    </div>
  );
}
